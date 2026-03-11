// SushiX Engine v4.0 - SUSHIX CLONE
// Optimized for Standalone "SushiX" branding

let scriptVault = JSON.parse(localStorage.getItem('luaorb_scripts')) || [];

function renderRepo() {
    scriptVault = JSON.parse(localStorage.getItem('luaorb_scripts')) || [];
    const list = document.getElementById("repo-list");
    if (!list) return;
    list.innerHTML = "";
    scriptVault.forEach(script => {
        const row = document.createElement("div");
        row.className = "table-row";
        row.innerHTML = `
            <span class="name">${script.name}</span>
            <span>${script.size}</span>
            <span class="badge ${script.protection === 'ELITE' ? 'success' : 'warning'}">${script.protection}</span>
            <button class="row-btn" data-name="${script.name}">LOADER</button>
        `;
        list.appendChild(row);
    });

    document.querySelectorAll(".row-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const name = btn.dataset.name;
            const cleanName = name.replace('.lua', '').toLowerCase().replace(/ /g, '_');
            const loaderLink = `https://ypibsvanderdev.github.io/LuaOrb/raw/${cleanName}.lua`;
            document.getElementById("loader-str").value = `loadstring(game:HttpGet("${loaderLink}"))()`;
            document.getElementById("loader-modal").style.display = "flex";
        });
    });
}

// Tab Switching
document.querySelectorAll(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
        const tab = btn.dataset.tab;
        if (!tab) return;
        document.querySelectorAll(".nav-item").forEach(i => i.classList.remove("active"));
        document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        document.getElementById(`tab-${tab}`).classList.add("active");
        if (tab === 'repository') renderRepo();
    });
});

const srcCode = document.getElementById("source-code");
const outCode = document.getElementById("output-code");
const obfBtn = document.getElementById("obfuscate-btn");
const deployBtn = document.getElementById("deploy-hub-btn");
const terminal = document.getElementById("status-terminal");
const copyBtn = document.getElementById("copy-btn");
const uploadBtn = document.getElementById("upload-btn");
const fileUpload = document.getElementById("file-upload");

function logTerm(msg, type = "info") {
    const p = document.createElement("p");
    p.textContent = `> [${new Date().toLocaleTimeString()}] ${msg}`;
    if (type === 'warn') p.style.color = '#ffbd2e';
    if (type === 'err') p.style.color = '#ff3366';
    terminal.appendChild(p);
    terminal.scrollTop = terminal.scrollHeight;
}

// SushiX "Mean" Engine
function luaorbObfuscate(source) {
    if (!source || source.trim() === '') return "-- [!] Error: No input provided.";

    // ANTI-BROWSER / ANTI-BOT HEADER (INTERNAL)
    let protectionHeader = `-- [[ SUSHIX ENVIRONMENT INTEGRITY CHECK ]] --
local function _O()
    local _h = {["User-Agent"] = "Roblox/WinInet"}
    if not (identifyexecutor or getexecutorname) then
        -- CRASH BROWSER ENVIRONMENTS
        while true do end
    end
end
pcall(_O)
`;

    const lines = source.split('\n').filter(l => l.trim() !== '');
    const states = [];
    lines.forEach((line, index) => {
        states.push({ id: (index + 1) * 100, code: line, next: (index + 1 < lines.length) ? (index + 2) * 100 : 0 });
    });

    // PURE OBFUSCATION LOGIC
    const sym = { SV: "_S" + Math.random().toString(36).substr(2, 5), DS: "_D" + Math.random().toString(36).substr(2, 5), ENV: "_E" + Math.random().toString(36).substr(2, 5) };

    let lua = protectionHeader + `\nlocal ${sym.ENV} = {loadstring or load, table.concat, string.char };\n`;
    lua += `local function run(...)\n`;
    lua += `    local ${sym.SV} = ${states[0].id};\n`;
    lua += `    local ${sym.DS} = {\n`;

    states.forEach(s => {
        const key = Math.floor(Math.random() * 255);
        const bytes = Array.from(new TextEncoder().encode(s.code));
        const enc = bytes.map(b => b ^ key);
        lua += `        [${s.id}] = function() local _c={${enc.join(',')}}; local _k=${key}; local _r={};\n`;
        lua += `        for i=1,#_c do _r[i]=${sym.ENV}[3]((bit32 and bit32.bxor(_c[i],_k) or _c[i]-_k%256)) end;\n`;
        lua += `        ${sym.ENV}[1](${sym.ENV}[2](_r))(); return ${s.next} end,\n`;
    });

    lua += `    };\n    while ${sym.SV} ~= 0 do ${sym.SV} = ${sym.DS}[${sym.SV}]() end\nend\nreturn run(...)\n`;

    return lua;
}

obfBtn.addEventListener("click", () => {
    if (srcCode.value.trim() === "") return;
    obfBtn.disabled = true;
    obfBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ANALYZING...`;
    terminal.innerHTML = "";
    logTerm("Initializing SushiX-Elite Virtual Machine...");

    setTimeout(() => {
        outCode.value = luaorbObfuscate(srcCode.value);
        logTerm("SUCCESS: Protection Layer Active.", "info");
        obfBtn.disabled = false;
        obfBtn.innerHTML = `<i class="fas fa-bolt"></i> PROTECT SCRIPT`;
    }, 1200);
});

deployBtn.addEventListener("click", async () => {
    const code = outCode.value;
    if (!code) {
        logTerm("ERR: Obfuscate the script first!", "err");
        return;
    }
    const name = prompt("Deployment Name:", "unnamed_script");
    if (!name) return;

    logTerm(`Commencing Local Offline Vaulting...`);

    // Offline simulation mapping to repository locally
    const newScript = { name: name + ".lua", size: (code.length / 1024).toFixed(1) + ' KB', protection: 'ELITE' };
    scriptVault.unshift(newScript);
    localStorage.setItem('luaorb_scripts', JSON.stringify(scriptVault));

    logTerm(`SUCCESS: ${name} vaulted in Offline Node.`, "info");
    logTerm(`Loader generated with Anti-Browser protection.`);

    const cleanName = name.replace('.lua', '').toLowerCase().replace(/ /g, '_');
    const loaderLink = `https://ypibsvanderdev.github.io/LuaOrb/raw/${cleanName}.lua`; // Custom backend link
    document.getElementById("loader-str").value = `loadstring(game:HttpGet("${loaderLink}"))()`;
    document.getElementById("loader-modal").style.display = "flex";

    // Update repository UI
    renderRepo();
});

copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(outCode.value);
    copyBtn.innerText = "COPIED";
    setTimeout(() => copyBtn.innerText = "COPY", 2000);
});

if (uploadBtn) {
    uploadBtn.addEventListener("click", () => fileUpload.click());
}
if (fileUpload) {
    fileUpload.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Auto-check all protections
        document.querySelectorAll('.setting-group input[type="checkbox"]').forEach(box => {
            if (!box.checked) box.click(); // Using click is safer for UI rendering if attached
            box.checked = true;
        });

        const uploadedName = file.name;
        const reader = new FileReader();
        reader.onload = (ev) => {
            srcCode.value = ev.target.result;
            // Auto obfuscate
            setTimeout(() => {
                obfBtn.click();

                // Wait for obfuscation to finish (takes 1200ms) then auto save to repo
                setTimeout(() => {
                    const code = outCode.value;
                    if (code) {
                        const newScript = { name: uploadedName, size: (code.length / 1024).toFixed(1) + ' KB', protection: 'ELITE' };
                        scriptVault.unshift(newScript);
                        localStorage.setItem('luaorb_scripts', JSON.stringify(scriptVault));
                        renderRepo();
                        logTerm(`SUCCESS: Auto-vaulted ${uploadedName} to Repository.`, "info");
                    }
                }, 1300);
            }, 300);
        };
        reader.readAsText(file);
    });
}

const modal = document.getElementById("loader-modal");
const closeModal = document.querySelector(".close-modal");
const modalCopy = document.getElementById("modal-copy-btn");

closeModal.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if (e.target == modal) modal.style.display = "none"; }

modalCopy.addEventListener("click", () => {
    navigator.clipboard.writeText(document.getElementById("loader-str").value);
    modalCopy.innerText = "COPIED";
    setTimeout(() => modalCopy.innerText = "COPY", 2000);
});

renderRepo();
