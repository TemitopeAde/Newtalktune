"use client";

import Link from "next/link";
import React from "react";
import { motion } from "framer-motion";

const Page = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-4 lg:gap-8 flex-col items-center justify-center min-h-screen px-4"
        >
            <div className="flex items-center justify-center">
                <img src="/icons/check.svg" alt="Success" />
            </div>
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-bold text-center">Password Reset</h1>
                <p className="text-sm text-gray-300 leading-relaxed text-center">
                    Password reset successful, proceed to login
                </p>
            </div>

            <Link
                href="/auth/login"
                className="w-full max-w-md text-center bg-white transition-all duration-300 z-0 whitespace-nowrap hover:bg-white/90 rounded-[8px] py-3 px-5 text-[#00246B] font-bold text-[16px]"
            >
                Proceed to Login
            </Link>
        </motion.div>
    );
};

export default Page;
