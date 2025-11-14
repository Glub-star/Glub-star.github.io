document.querySelectorAll(".container[data-github-repo]").forEach(container => {
    const repo = container.dataset.githubRepo; // "owner/repo"
    const [owner, repoName] = repo.split("/");

    const codeContainer = container.querySelector(".code-container");

    // Fetch the file tree from GitHub API
    fetch(`https://api.github.com/repos/${owner}/${repoName}/git/trees/main?recursive=1`)
        .then(res => res.json())
        .then(data => {
            // Filter files: blobs only, exclude readmes
            const files = data.tree.filter(f => f.type === "blob" && !/readme/i.test(f.path));

            files.forEach((file, index) => {
                const rawUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/main/${file.path}`;

                // Build code box
                const codeBox = document.createElement("div");
                codeBox.classList.add("code-box");

                const fileTitle = document.createElement("div");
                fileTitle.classList.add("filename");
                fileTitle.textContent = file.path;

                const collapseBtn = document.createElement("button");
                collapseBtn.classList.add("collapse-btn");
                collapseBtn.textContent = "Show Code ▼";
                collapseBtn.onclick = () => toggleCollapse(collapseBtn);

                const codeContent = document.createElement("div");
                codeContent.classList.add("code-content");

                const pre = document.createElement("pre");
                const code = document.createElement("code");
                code.textContent = "Loading...";

                pre.appendChild(code);
                codeContent.appendChild(pre);

                const copyBtn = document.createElement("button");
                copyBtn.classList.add("copy-btn");
                copyBtn.textContent = "Copy";
                copyBtn.onclick = () => {
                    navigator.clipboard.writeText(code.textContent)
                        .then(() => alert("Code copied!"))
                        .catch(() => alert("Failed to copy code."));
                };

                codeContent.appendChild(copyBtn);

                codeBox.appendChild(fileTitle);
                codeBox.appendChild(collapseBtn);
                codeBox.appendChild(codeContent);

                codeContainer.appendChild(codeBox);

                // Fetch the raw file content
                fetch(rawUrl)
                    .then(r => r.text())
                    .then(text => {
                        code.textContent = text;
                    })
                    .catch(() => {
                        code.textContent = "Failed to load code.";
                    });
            });
        })
        .catch(() => {
            codeContainer.textContent = "Failed to fetch repository files.";
        });
});

function toggleCollapse(btn) {
    const content = btn.nextElementSibling;

    if (content.style.display === "block") {
        content.style.display = "none";
        btn.textContent = "Show Code ▼";
    } else {
        content.style.display = "block";
        btn.textContent = "Hide Code ▲";
    }
}

function copyCode(id) {
    const code = document.getElementById(id).innerText;

    navigator.clipboard.writeText(code).then(() => {
        alert("Code copied!");
    });
}