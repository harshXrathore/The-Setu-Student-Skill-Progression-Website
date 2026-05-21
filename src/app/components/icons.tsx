import React from "react";

export const BubblesIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <circle cx="7" cy="17" r="5" />
        <circle cx="17" cy="7" r="4" />
        <circle cx="6" cy="7" r="2" />
    </svg>
);
