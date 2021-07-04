export const sizeToString = (bytes) => {
    if (bytes === 0 || bytes === "0") return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + " " + sizes[i];
};

export const fixUrlHash = (path) => {
    return path;
};

export const setCookie = (name, value, days) => {
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    }
    document.cookie = name + "=" + (value || "") + "; path=/";
};

export const setGetParameter = (paramName, paramValue) => {
    let url = window.location.href;

    if (url.indexOf(paramName + "=") >= 0) {
        const prefix = url.substring(0, url.indexOf(paramName));
        let suffix = url.substring(url.indexOf(paramName));
        suffix = suffix.substring(suffix.indexOf("=") + 1);
        suffix =
            suffix.indexOf("&") >= 0
                ? suffix.substring(suffix.indexOf("&"))
                : "";
        url = prefix + paramName + "=" + paramValue + suffix;
    } else {
        if (url.indexOf("?") < 0) url += "?" + paramName + "=" + paramValue;
        else url += "&" + paramName + "=" + paramValue;
    }
    if (url === window.location.href) {
        return;
    }
    window.history.pushState(null, null, url);
};

export const allowSharePreview = () => {
    if (!window.isSharePage) {
        return true;
    }
    if (window.isSharePage) {
        if (window.shareInfo.allowPreview) {
            return true;
        }
        if (window.userInfo.uid === -1) {
            return false;
        }
        return true;
    }
};

export const checkGetParameters = (field) => {
    const url = window.location.href;
    if (url.indexOf("?" + field + "=") !== -1) return true;
    else if (url.indexOf("&" + field + "=") !== -1) return true;
    return false;
};

export const changeThemeColor = (color) => {
    const metaThemeColor = window.document.querySelector(
        "meta[name=theme-color]"
    );
    metaThemeColor.setAttribute("content", color);
};

export function bufferDecode(value) {
    return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}

// ArrayBuffer to URLBase64
export function bufferEncode(value) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(value)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}

export function pathBack(path) {
    const folders =
        path !== null
            ? path.substr(1).split("/")
            : this.props.path.substr(1).split("/");
    return "/" + folders.slice(0, folders.length - 1).join("/");
}

export function filePath(file) {
    return file.path === "/"
        ? file.path + file.name
        : file.path + "/" + file.name;
}

export function hex2bin(hex) {
    return parseInt(hex, 16).toString(2).padStart(8, "0");
}

export function pathJoin(parts, sep) {
    const separator = sep || "/";
    parts = parts.map((part, index) => {
        if (index) {
            part = part.replace(new RegExp("^" + separator), "");
        }
        if (index !== parts.length - 1) {
            part = part.replace(new RegExp(separator + "$"), "");
        }
        return part;
    });
    return parts.join(separator);
}

export function basename(path) {
    const pathList = path.split("/");
    pathList.pop();
    return pathList.join("/") === "" ? "/" : pathList.join("/");
}

export function filename(path) {
    const pathList = path.split("/");
    return pathList.pop();
}

export function transformTime(timestamp = +new Date()) {
    if (timestamp) {
        const time = new Date(timestamp);
        const y = time.getFullYear(); //getFullYear方法以四位數字返回年份
        const M = time.getMonth() + 1; // getMonth方法從 Date 對像返回月份 (0 ~ 11)，返回結果需要手動加一
        const d = time.getDate(); // getDate方法從 Date 對像返回一個月中的某一天 (1 ~ 31)
        const h = time.getHours(); // getHours方法返回 Date 對象的小時 (0 ~ 23)
        const m = time.getMinutes(); // getMinutes方法返回 Date 對象的分鐘 (0 ~ 59)
        const s = time.getSeconds(); // getSeconds方法返回 Date 對象的秒數 (0 ~ 59)
        return y + "-" + M + "-" + d + " " + h + ":" + m + ":" + s;
    } else {
        return "";
    }
}

export function randomStr(length) {
    let result = "";
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
}

export function getNumber(base, conditions) {
    conditions.forEach((v) => {
        if (v) {
            base++;
        }
    });
    return base;
}

export const isMac = () => {
    return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
};

export function vhCheck() {
    const vh = window.innerHeight;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
}
