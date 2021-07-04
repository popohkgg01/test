import { isMac } from "../utils";
import pathHelper from "../utils/page";
import Auth from "../middleware/Auth";
import {
    changeContextMenu,
    openLoadingDialog,
    openMusicDialog,
    showImgPreivew,
    toggleSnackbar,
} from "./index";
import { isPreviewable } from "../config";
import { push } from "connected-react-router";

export const removeSelectedTargets = (fileIds) => {
    return {
        type: "RMOVE_SELECTED_TARGETS",
        fileIds,
    };
};

export const addSelectedTargets = (targets) => {
    return {
        type: "ADD_SELECTED_TARGETS",
        targets,
    };
};

export const setSelectedTarget = (targets) => {
    return {
        type: "SET_SELECTED_TARGET",
        targets,
    };
};

export const setLastSelect = (file, index) => {
    return {
        type: "SET_LAST_SELECT",
        file,
        index,
    };
};

export const setShiftSelectedIds = (shiftSelectedIds) => {
    return {
        type: "SET_SHIFT_SELECTED_IDS",
        shiftSelectedIds,
    };
};

export const openPreview = () => {
    return (dispatch, getState) => {
        const {
            explorer: { selected },
            router: {
                location: { pathname },
            },
        } = getState();
        const isShare = pathHelper.isSharePage(pathname);
        if (isShare) {
            const user = Auth.GetUser();
            if (!Auth.Check() && user && !user.group.shareDownload) {
                dispatch(toggleSnackbar("top", "right", "請先登錄", "warning"));
                dispatch(changeContextMenu("file", false));
                return;
            }
        }

        dispatch(changeContextMenu("file", false));
        const previewPath =
            selected[0].path === "/"
                ? selected[0].path + selected[0].name
                : selected[0].path + "/" + selected[0].name;
        switch (isPreviewable(selected[0].name)) {
            case "img":
                dispatch(showImgPreivew(selected[0]));
                return;
            case "msDoc":
                if (isShare) {
                    dispatch(
                        push(
                            selected[0].key +
                                "/doc?name=" +
                                encodeURIComponent(selected[0].name) +
                                "&share_path=" +
                                encodeURIComponent(previewPath)
                        )
                    );
                    return;
                }
                dispatch(
                    push(
                        "/doc?p=" +
                            encodeURIComponent(previewPath) +
                            "&id=" +
                            selected[0].id
                    )
                );
                return;
            case "audio":
                dispatch(openMusicDialog());
                return;
            case "video":
                if (isShare) {
                    dispatch(
                        push(
                            selected[0].key +
                                "/video?name=" +
                                encodeURIComponent(selected[0].name) +
                                "&share_path=" +
                                encodeURIComponent(previewPath)
                        )
                    );
                    return;
                }
                dispatch(
                    push(
                        "/video?p=" +
                            encodeURIComponent(previewPath) +
                            "&id=" +
                            selected[0].id
                    )
                );
                return;
            case "pdf":
                if (isShare) {
                    dispatch(
                        push(
                            selected[0].key +
                                "/pdf?name=" +
                                encodeURIComponent(selected[0].name) +
                                "&share_path=" +
                                encodeURIComponent(previewPath)
                        )
                    );
                    return;
                }
                dispatch(
                    push(
                        "/pdf?p=" +
                            encodeURIComponent(previewPath) +
                            "&id=" +
                            selected[0].id
                    )
                );
                return;
            case "edit":
                if (isShare) {
                    dispatch(
                        push(
                            selected[0].key +
                                "/text?name=" +
                                encodeURIComponent(selected[0].name) +
                                "&share_path=" +
                                encodeURIComponent(previewPath)
                        )
                    );
                    return;
                }
                dispatch(
                    push(
                        "/text?p=" +
                            encodeURIComponent(previewPath) +
                            "&id=" +
                            selected[0].id
                    )
                );
                return;
            case "code":
                if (isShare) {
                    dispatch(
                        push(
                            selected[0].key +
                                "/code?name=" +
                                encodeURIComponent(selected[0].name) +
                                "&share_path=" +
                                encodeURIComponent(previewPath)
                        )
                    );
                    return;
                }
                dispatch(
                    push(
                        "/code?p=" +
                            encodeURIComponent(previewPath) +
                            "&id=" +
                            selected[0].id
                    )
                );
                return;
            default:
                dispatch(openLoadingDialog("獲取下載地址..."));
                return;
        }
    };
};

export const selectFile = (file, event, fileIndex) => {
    const { ctrlKey, metaKey, shiftKey } = event;
    return (dispatch, getState) => {
        // 多種組合操作忽略
        if ([ctrlKey, metaKey, shiftKey].filter(Boolean).length > 1) {
            return;
        }
        const isMacbook = isMac();
        const { explorer } = getState();
        const {
            selected,
            lastSelect,
            dirList,
            fileList,
            shiftSelectedIds,
        } = explorer;
        if (
            shiftKey &&
            !ctrlKey &&
            !metaKey &&
            selected.length !== 0 &&
            // 點選型別一樣
            file.type === lastSelect.file.type
        ) {
            // shift 多選
            // 取消原有選擇
            dispatch(removeSelectedTargets(selected.map((v) => v.id)));
            // 新增新選擇
            const begin = Math.min(lastSelect.index, fileIndex);
            const end = Math.max(lastSelect.index, fileIndex);
            const list = file.type === "dir" ? dirList : fileList;
            const newShiftSelected = list.slice(begin, end + 1);
            return dispatch(addSelectedTargets(newShiftSelected));
        }
        dispatch(setLastSelect(file, fileIndex));
        dispatch(setShiftSelectedIds([]));
        if ((ctrlKey && !isMacbook) || (metaKey && isMacbook)) {
            // Ctrl/Command 單擊新增/刪除
            const presentIndex = selected.findIndex((value) => {
                return value.id === file.id;
            });
            if (presentIndex !== -1) {
                return dispatch(removeSelectedTargets([file.id]));
            }
            return dispatch(addSelectedTargets([file]));
        }
        // 單選
        return dispatch(setSelectedTarget([file]));
    };
};
