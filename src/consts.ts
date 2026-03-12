import type { Site, Metadata, Socials } from "@types";

export const SITE: Site = {
  NAME: "Travis McGhee",
EMAIL: "",
  NUM_POSTS_ON_HOMEPAGE: 4,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Cybersecurity blog and project portfolio by Travis McGhee.",
};

export const BLOG: Metadata = {
  TITLE: "Blog",
  DESCRIPTION: "Posts on cybersecurity, privacy, and digital communication.",
};

export const PROJECTS: Metadata = {
  TITLE: "Projects",
  DESCRIPTION: "Capstone and cybersecurity projects with outcomes and reflections.",
};

export const SOCIALS: Socials = [
  {
    NAME: "github",
    HREF: "https://github.com/nottrav",
  },
  {
    NAME: "linkedin",
    HREF: "https://www.linkedin.com/in/travismcghee/",
  },
];
