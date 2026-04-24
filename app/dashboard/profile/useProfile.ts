"use client"

import { useCallback, useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/app/lib/firebase"
import { getGoogleDriveAccessToken } from "@/app/lib/auth.service"
import { loadProfileFromDrive, saveProfileToDrive } from "@/app/lib/profile.service"
import { loadProfileFromDb, saveProfileToDb } from "@/app/lib/profileDb.service"

export type ProfileState = {
  personal: {
    displayName: string
    email: string
    photoURL: string
    phone: string
    alternateEmail: string
  }
  business: {
    shopName: string
    gstNumber: string
    businessType: string
    upiId: string
    invoicePrefix: string
  }
  address: {
    address: string
    district: string
    state: string
    pincode: string
  }
  banking: {
    accountHolderName: string
    accountNumber: string
    ifscCode: string
    bankName: string
  }
  settings: {
    termsAndConditions: string
  }
  userId?: string
  updatedAt?: string
}

const defaultState: ProfileState = {
  personal: {
    displayName: "",
    email: "",
    photoURL: "",
    phone: "",
    alternateEmail: "",
  },
  business: {
    shopName: "",
    gstNumber: "",
    businessType: "retail",
    upiId: "",
    invoicePrefix: "INV",
  },
  address: {
    address: "",
    district: "",
    state: "",
    pincode: "",
  },
  banking: {
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
  },
  settings: {
    termsAndConditions: "Goods once sold will not be taken back or exchanged.",
  },
}

export default function useProfile() {
  const [profile, setProfile] = useState<ProfileState>(defaultState)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let isMounted = true

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return

      if (!user) {
        setProfile(defaultState)
        setLoading(false)
        return
      }

      const firebaseProfile = buildFirebaseProfile(user)
      setProfile(firebaseProfile)

      try {
        const localProfile = await loadProfileFromDb(user.uid)
        const localMerged = localProfile ? mergeWithFirebaseProfile(localProfile, user) : firebaseProfile

        if (isMounted) {
          setProfile(localMerged)
        }

        const token = await getGoogleDriveAccessToken(false)
        if (token && typeof token === "string") {
          const driveProfile = await loadProfileFromDrive(token)

          if (driveProfile) {
            const latestProfile = getLatestProfile(localProfile, driveProfile)
            const mergedLatest = mergeWithFirebaseProfile(latestProfile, user)

            if (isMounted) {
              setProfile(mergedLatest)
            }

            if (!localProfile || latestProfile.updatedAt !== localProfile.updatedAt) {
              await persistProfileLocally(mergedLatest, user.uid)
            }
          }
        }
      } catch (error) {
        console.error("Failed to initialize profile:", error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    })

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [])

  const saveProfile = useCallback(async (newData: ProfileState) => {
    const user = auth.currentUser
    if (!user) throw new Error("User not authenticated")

    setSaving(true)
    try {
      const mergedProfile = mergeWithFirebaseProfile(newData, user)
      const savedProfile = await persistProfileLocally(mergedProfile, user.uid)
      setProfile(savedProfile)

      const token = await getGoogleDriveAccessToken(false)
      if (token && typeof token === "string") {
        await saveProfileToDrive(stripProfileMeta(savedProfile), token)
      }

      return savedProfile
    } catch (error) {
      console.error("Save failed:", error)
      throw error
    } finally {
      setSaving(false)
    }
  }, [])

  return {
    profile,
    loading,
    saving,
    saveProfile,
    setProfile,
  }
}

function buildFirebaseProfile(user: NonNullable<typeof auth.currentUser>): ProfileState {
  return {
    ...defaultState,
    userId: user.uid,
    personal: {
      ...defaultState.personal,
      displayName: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
    },
  }
}

function mergeWithFirebaseProfile(
  profileData: ProfileState,
  user: NonNullable<typeof auth.currentUser>
): ProfileState {
  return {
    ...defaultState,
    ...profileData,
    userId: user.uid,
    personal: {
      ...defaultState.personal,
      ...profileData.personal,
      displayName: user.displayName || profileData.personal?.displayName || "",
      email: user.email || profileData.personal?.email || "",
      photoURL: user.photoURL || profileData.personal?.photoURL || "",
    },
  }
}

function getLatestProfile(
  localProfile: ProfileState | null,
  driveProfile: ProfileState
): ProfileState {
  const localUpdatedAt = localProfile?.updatedAt ? new Date(localProfile.updatedAt).getTime() : 0
  const driveUpdatedAt = driveProfile.updatedAt ? new Date(driveProfile.updatedAt).getTime() : 0
  return driveUpdatedAt >= localUpdatedAt ? driveProfile : (localProfile || driveProfile)
}

function stripProfileMeta(profile: ProfileState): Omit<ProfileState, "userId" | "updatedAt"> {
  const { userId, updatedAt, ...rest } = profile
  return rest
}

async function persistProfileLocally(profile: ProfileState, userId: string): Promise<ProfileState> {
  return saveProfileToDb(stripProfileMeta(profile), userId)
}
