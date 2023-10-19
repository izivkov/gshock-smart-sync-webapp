"use client"

import React from "react"

const MenuItem: React.FC = () => {
    return (
        <a
            href="/ui/time/Time"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800 hover:dark:bg-opacity-30"
            target="_blank"
            rel="noopener noreferrer"
        >
            <h2 className={`mb-3 text-2xl font-semibold`}>
                Learn{' '}
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    -&gt;
                </span>
            </h2>
            <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
                Learn about Next.js in an interactive course with&nbsp;quizzes!
            </p>
        </a>
    )
}

export default MenuItem