import { signInWithPopup } from "firebase/auth";
import { auth, provider, Button } from "@/app/components/client/useClient";
import { useRouter } from "next/navigation";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { FcGoogle } from "react-icons/fc";
import logo from "../../../assets/logo.svg";
import { useRef } from "react";

// 3D Background Sub-Component
const AnimatedBackground = () => {
    const meshRef = useRef<any>(null);
    useFrame((state) => {
        if (meshRef.current) {
            const time = state.clock.getElapsedTime();
            const hue = Math.sin(time * 0.3) * 0.05 + 0.45;
            meshRef.current.color.setHSL(hue, 0.7, 0.5);
        }
    });

    return (
        <Float speed={2} rotationIntensity={2} floatIntensity={2}>
            <Sphere args={[1, 64, 64]} scale={2.5}>
                <MeshDistortMaterial ref={meshRef} distort={0.5} speed={2} roughness={0.1} metalness={0.2} />
            </Sphere>
        </Float>
    );
};

// Main Login Component
export default function Login() {
    const router = useRouter();

    const handleLogin = async () => {
        try {
            await signInWithPopup(auth, provider);
            router.push("/dashboard");
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    return (
        <div className="relative h-screen w-full bg-[#0a0f0d] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 5] }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} />
                    <AnimatedBackground />
                </Canvas>
            </div>

            <div className="relative z-10 p-10 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[50px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center gap-8 w-[400px]">
                <div className="relative w-24 h-24 flex items-center justify-center">
                    <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                    <div className="relative w-20 h-20 bg-gradient-to-br to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl border border-white/50">
                        <img src={logo.src} alt="Logo" className="absolute w-12 h-12" />
                    </div>
                </div>

                <div className="text-center">
                    <h1 className="text-white text-4xl font-black tracking-tight mb-2">Login</h1>
                    <p className="text-emerald-400/80 font-medium uppercase tracking-[0.2em] text-xs">Secure Access</p>
                </div>

                <Button onClick={handleLogin} title="Continue with Google" className="p-5 border border-white/70 rounded-[10px] text-white" icon={<FcGoogle className="text-2xl" />} />

                <p className="text-white/30 text-[10px] text-center uppercase tracking-widest">
                    Powered by Firebase Auth
                </p>
            </div>
        </div>
    );
}
