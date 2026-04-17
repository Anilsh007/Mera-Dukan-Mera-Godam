// define once and reuse the client throughout your app
"use client";

// import aur export all components from a single file
export { default as Custombutton } from "../utility/Button";
export { default as Header } from "../common/Header";
export { default as Login } from "../reuseModule/login";
export { default as ProtectedRoute } from "../reuseModule/ProtectedRoute";
export { default as Sidebar } from "../common/Sidebar";
export { auth, provider } from "../../lib/firebase";
export { db } from "../../lib/db";
export { default as Button } from "../utility/Button";

// Theme exports
export { ThemeProvider, useTheme } from "../theme/ThemeProvider";
export { default as ThemeToggle } from "../theme/ThemeToggle";
