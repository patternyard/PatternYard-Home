import { PUBLIC_STUDIO_URL } from "$env/static/public";

export default {
    /**
     * PenguinMod's editor page
     */
    editor: `${PUBLIC_STUDIO_URL}/editor.html`,

    /**
     * PenguinMod's credits page
     */
    credits: `${PUBLIC_STUDIO_URL}/credits.html`,

    /**
     * PenguinMod's contact page
     */
    contact: `${PUBLIC_STUDIO_URL}/contact.html`,

    /**
     * Donation pages for sites
     */
    donate: {
        scratch: "https://www.scratchfoundation.org/donate",
        turbowarp: "https://github.com/sponsors/GarboMuffin"
    },

    /**
     * PenguinMod's packager page
     */
    packager: `${PUBLIC_STUDIO_URL}/PenguinMod-Packager/`,

    /**
     * PatternYard's documentation site (equivalent of the upstream wiki)
     */
    wiki: "https://docs.patternyard.dev",

    /**
     * PenguinMod's Discord invite
     */
    discord: "https://discord.gg/NZ9MBMYTZh",

    /**
     * Scratch's website
     */
    scratch: "https://scratch.mit.edu",

    /**
     * TurboWarp's website
     */
    turbowarp: "https://turbowarp.org",

    /**
     * PatternYard's github org
     */
    github: "https://github.com/patternyard/",

    /**
     * PatternYard's issues page
     */
    issues: "https://github.com/patternyard/PatternYard-Home/issues",
}
