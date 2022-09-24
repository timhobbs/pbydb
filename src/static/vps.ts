import { default as axios } from 'axios';

const vpsDbUrl = `https://fraesh.github.io/vps-db/vpsdb.json?ts=${Date.now()}`;

export const getVpsdb = async (vpsData: any) => {
    // Return from cache
    if (vpsData) {
        return vpsData;
    }

    // Get from API
    const { data } = await axios.get(vpsDbUrl).then(db => db);

    // Process data
    if (!data[0].tableIds || data[0].tableIds?.length === 0) {
        data.forEach((datum: any) => {
            if (!datum.tableFiles || datum.tableFiles.length === 0) {
                return;
            }

            datum.tableIds = datum.tableFiles.reduce((acc: string[], table: any) => {
                acc.push(table.id);

                return acc;
            }, []);
        });
    }

    // Set cached
    vpsData = data;

    return data;
};

// ****************************************************************************
// From vps app
// ****************************************************************************

export const getVpslookupData = (r: any[]) => {
    const ho = ["GameFileName", "GameName", "GameDisplay", "MediaSearch", "Manufact", "GameYear", "NumPlayers", "GameType", "Category", "GameTheme", "WebLinkURL", "IPDBNum", "AltRunMode", "DesignedBy", "Author", "GAMEVER", "Rom", "Tags", "VPS-ID"];
    const t = { theAtEnd: true, author: true, version: true, mod: true, ssf: true, vr: true };
    let n = [ho];
    r.sort((o,a)=>a.name > o.name ? -1 : 1)
    .forEach(o=>{
        let a: any[];
        (a = getGameFileName(o, t)) == null || a.forEach(([i, l])=>{
            let h, x, g, p, C, b;
            const d = getGameFileName(o, {
                theAtEnd: t.theAtEnd
            })[0][0];
            const u = [`${l.gameFileName || i}`, `${d}`, `${d}`, "", o.manufacturer || "", ((h = o.year) == null ? void 0 : h.toString()) || "", ((x = o.players) == null ? void 0 : x.toString()) || "", o.type || "", "", arrayToString(o.theme), ((g = o.ipdbUrl) == null ? void 0 : g.includes(".ipdb.org/machine.cgi?id=")) ? `"${o.ipdbUrl}"` : "", ((p = o.ipdbUrl) == null ? void 0 : p.includes(".ipdb.org/machine.cgi?id=")) ? o.ipdbUrl.split(".cgi?id=")[1] : "", "", arrayToString(o.designers), arrayToString(l.authors), l.version || "", ((C = o.romFiles) == null ? void 0 : C.length) && o.romFiles[0].version || "", arrayToString((b = l.features) == null ? void 0 : b.filter((w: any)=>!["incl. B2S", "incl. ROM", "incl. Art", "incl. PuP", "incl. Video", "no ROM"].includes(w))), l.id];
            n.push(u)
        });
    });

    return n;
};

export const getGameFileName = (r: any, t: any) => {
    let o;
    let n = r.name;
    return t.theAtEnd && r.name.slice(0, 4).toLowerCase() === "the " && (n = `${n.slice(4).trim()}, The`),
    ((o = r.tableFiles) == null ? void 0 : o.map((a: any)=>{
        let i, l, d, u;
        return [`${n} (${r.manufacturer} ${r.year})${t.author && ((i = a.authors) == null ? void 0 : i.length) ? ` ${a.authors[0]}` : ""}${t.version ? ` ${a.version || ""}` : ""}${t.ssf && ((l = a.features) == null ? void 0 : l.includes("SSF")) ? " SSF" : ""}${t.mod && ((d = a.features) == null ? void 0 : d.includes("MOD")) ? " MOD" : ""}${t.vr && ((u = a.features) == null ? void 0 : u.includes("VR")) ? " VR" : ""}`, a]
    })) || []
};

export const arrayToString = (r: any) => {
    (r == null ? void 0 : r.length) ? `"${r.join(", ")}"` : "";
};
