"use client"

import { useEffect, useState } from "react"
import { getProducts } from "./stock.service"
import { Product } from "@/app/lib/db"
import { auth } from "@/app/components/client/useClient"

export default function useGetStock(){

  const [products,setProducts] = useState<Product[]>([])
  const [loading,setLoading] = useState(true)

  async function loadProducts(){
    const userId = auth.currentUser?.email
    if(!userId){
      setProducts([])
      setLoading(false)
      return
    }

    const data = await getProducts(userId)
    setProducts(data)
    setLoading(false)
  }

  useEffect(()=>{
    loadProducts()
  },[])

  return{
    products,
    loading,
    reload:loadProducts
  }

}