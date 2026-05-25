const GITHUB_OWNER = import.meta.env.VITE_GITHUB_PROGRESS_OWNER || "RasmusDahlJensen";
const GITHUB_REPO = import.meta.env.VITE_GITHUB_PROGRESS_REPO || "InteractiveGearProg";
const GITHUB_BRANCH = import.meta.env.VITE_GITHUB_PROGRESS_BRANCH || "main";
const GITHUB_PROGRESS_PATH = import.meta.env.VITE_GITHUB_PROGRESS_PATH || "data/user-progress.json";

const CONTENTS_URL = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PROGRESS_PATH}`;

function encodeBase64Utf8(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeBase64Utf8(value) {
  const binary = atob(value.replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function githubHeaders(token) {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function normalizeStringArray(value) {
  return Array.isArray(value) ? value.filter(item => typeof item === "string") : [];
}

function normalizeHide(value) {
  return {
    item: Boolean(value?.item),
    prayer: Boolean(value?.prayer),
    construction: Boolean(value?.construction),
    slayer: Boolean(value?.slayer),
    spell: Boolean(value?.spell),
    skill: Boolean(value?.skill),
  };
}

export function buildProgressPayload({
  milestonesComplete,
  milestonesHidden,
  showBareBones,
  showRetirement,
  hide,
}) {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    milestonesComplete: [...milestonesComplete].sort(),
    milestonesHidden: [...milestonesHidden].sort(),
    showBareBones: Boolean(showBareBones),
    showRetirement: Boolean(showRetirement),
    hide: normalizeHide(hide),
  };
}

export function normalizeProgressPayload(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Progress file is not valid JSON.");
  }

  return {
    version: Number(payload.version) || 1,
    updatedAt: payload.updatedAt ?? null,
    milestonesComplete: normalizeStringArray(payload.milestonesComplete),
    milestonesHidden: normalizeStringArray(payload.milestonesHidden),
    showBareBones: Boolean(payload.showBareBones),
    showRetirement: Boolean(payload.showRetirement),
    hide: normalizeHide(payload.hide),
  };
}

export async function loadGitHubProgress(token) {
  const response = await fetch(`${CONTENTS_URL}?ref=${encodeURIComponent(GITHUB_BRANCH)}`, {
    headers: githubHeaders(token),
  });

  if (response.status === 404) {
    throw new Error(`Could not find ${GITHUB_PROGRESS_PATH} in ${GITHUB_OWNER}/${GITHUB_REPO}.`);
  }
  if (!response.ok) {
    throw new Error(`GitHub load failed with status ${response.status}.`);
  }

  const body = await response.json();
  const decoded = decodeBase64Utf8(body.content);
  return normalizeProgressPayload(JSON.parse(decoded));
}

export async function saveGitHubProgress(token, progress) {
  if (!token) throw new Error("Enter a GitHub token first.");

  const currentResponse = await fetch(`${CONTENTS_URL}?ref=${encodeURIComponent(GITHUB_BRANCH)}`, {
    headers: githubHeaders(token),
  });

  let sha;
  if (currentResponse.ok) {
    const current = await currentResponse.json();
    sha = current.sha;
  } else if (currentResponse.status !== 404) {
    throw new Error(`GitHub lookup failed with status ${currentResponse.status}.`);
  }

  const payload = normalizeProgressPayload(progress);
  const content = `${JSON.stringify(payload, null, 2)}\n`;
  const response = await fetch(CONTENTS_URL, {
    method: "PUT",
    headers: {
      ...githubHeaders(token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      branch: GITHUB_BRANCH,
      message: "Update personal chart progress",
      content: encodeBase64Utf8(content),
      ...(sha ? { sha } : {}),
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub save failed with status ${response.status}.`);
  }

  return normalizeProgressPayload(payload);
}

export const githubProgressTarget = {
  owner: GITHUB_OWNER,
  repo: GITHUB_REPO,
  branch: GITHUB_BRANCH,
  path: GITHUB_PROGRESS_PATH,
};
