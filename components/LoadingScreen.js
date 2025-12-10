"use client";

/**
 * Unified Loading Screen Component
 * Provides consistent loading experience across all pages
 */

export default function LoadingScreen({
    message = "Loading...",
    variant = "spinner",
    fullScreen = true,
    className = ""
}) {
    // Spinner variant - centered loading spinner with message
    if (variant === "spinner") {
        return (
            <div className={`${fullScreen ? 'min-h-screen' : 'h-full min-h-[400px]'} bg-gray-50 flex items-center justify-center px-4 ${className}`}>
                <div className="text-center">
                    {/* Animated spinner */}
                    <div className="relative mx-auto mb-4 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
                    </div>

                    {/* Loading message */}
                    <p className="text-gray-600 text-sm sm:text-base lg:text-lg font-medium">
                        {message}
                    </p>

                    {/* Subtle animated dots */}
                    <div className="flex justify-center gap-1 mt-3">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                </div>
            </div>
        );
    }

    // Skeleton variant - placeholder content layout
    if (variant === "skeleton") {
        return (
            <div className={`${fullScreen ? 'min-h-screen' : 'min-h-[400px]'} bg-gray-50`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    {/* Header skeleton */}
                    <div className="animate-pulse mb-6 sm:mb-8">
                        <div className="h-7 sm:h-8 bg-gray-200 rounded-lg w-48 sm:w-64 mb-2"></div>
                        <div className="h-4 sm:h-5 bg-gray-200 rounded w-72 sm:w-96"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                        {/* Sidebar skeleton */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm animate-pulse">
                                <div className="h-5 sm:h-6 bg-gray-200 rounded mb-4"></div>
                                <div className="space-y-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="h-4 bg-gray-200 rounded"></div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main content skeleton */}
                        <div className="lg:col-span-3 space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-xl p-4 sm:p-6 shadow-sm animate-pulse">
                                    <div className="h-5 sm:h-6 bg-gray-200 rounded mb-3 w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Inline variant - small loader for buttons/sections
    if (variant === "inline") {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <span className="text-gray-600 text-sm sm:text-base">{message}</span>
                </div>
            </div>
        );
    }

    // Default fallback to spinner
    return (
        <div className={`${fullScreen ? 'min-h-screen' : 'min-h-[400px]'} bg-gray-50 flex items-center justify-center`}>
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-sm sm:text-base lg:text-lg">{message}</p>
            </div>
        </div>
    );
}
