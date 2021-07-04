import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
    closeAllModals,
    toggleSnackbar,
    setModalsLoading,
    refreshFileList,
    refreshStorage,
    openLoadingDialog,
} from "../../actions/index";
import PathSelector from "./PathSelector";
import API, { baseURL } from "../../middleware/Api";
import {
    withStyles,
    Button,
    TextField,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    DialogContentText,
    CircularProgress,
} from "@material-ui/core";
import Loading from "../Modals/Loading";
import CopyDialog from "../Modals/Copy";
import CreatShare from "../Modals/CreateShare";
import { withRouter } from "react-router-dom";
import pathHelper from "../../utils/page";
import PurchaseShareDialog from "../Modals/PurchaseShare";
import Auth from "../../middleware/Auth";
import DecompressDialog from "../Modals/Decompress";
import CompressDialog from "../Modals/Compress";
import RelocateDialog from "../Modals/Relocate";

const styles = (theme) => ({
    wrapper: {
        margin: theme.spacing(1),
        position: "relative",
    },
    buttonProgress: {
        color: theme.palette.secondary.light,
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12,
    },
    contentFix: {
        padding: "10px 24px 0px 24px",
    },
});

const mapStateToProps = (state) => {
    return {
        path: state.navigator.path,
        selected: state.explorer.selected,
        modalsStatus: state.viewUpdate.modals,
        modalsLoading: state.viewUpdate.modalsLoading,
        dirList: state.explorer.dirList,
        fileList: state.explorer.fileList,
        dndSignale: state.explorer.dndSignal,
        dndTarget: state.explorer.dndTarget,
        dndSource: state.explorer.dndSource,
        loading: state.viewUpdate.modals.loading,
        loadingText: state.viewUpdate.modals.loadingText,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        closeAllModals: () => {
            dispatch(closeAllModals());
        },
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        },
        setModalsLoading: (status) => {
            dispatch(setModalsLoading(status));
        },
        refreshFileList: () => {
            dispatch(refreshFileList());
        },
        refreshStorage: () => {
            dispatch(refreshStorage());
        },
        openLoadingDialog: (text) => {
            dispatch(openLoadingDialog(text));
        },
    };
};

class ModalsCompoment extends Component {
    state = {
        newFolderName: "",
        newFileName: "",
        newName: "",
        selectedPath: "",
        selectedPathName: "",
        secretShare: false,
        sharePwd: "",
        shareUrl: "",
        downloadURL: "",
        remoteDownloadPathSelect: false,
        source: "",
        purchaseCallback: null,
    };

    handleInputChange = (e) => {
        this.setState({
            [e.target.id]: e.target.value,
        });
    };

    newNameSuffix = "";
    downloaded = false;

    UNSAFE_componentWillReceiveProps = (nextProps) => {
        if (this.props.dndSignale !== nextProps.dndSignale) {
            this.dragMove(nextProps.dndSource, nextProps.dndTarget);
            return;
        }
        if (this.props.loading !== nextProps.loading) {
            // 打包下載
            if (nextProps.loading === true) {
                if (nextProps.loadingText === "打包中...") {
                    if (
                        pathHelper.isSharePage(this.props.location.pathname) &&
                        this.props.share &&
                        this.props.share.score > 0
                    ) {
                        this.scoreHandler(this.archiveDownload);
                        return;
                    }
                    this.archiveDownload();
                } else if (nextProps.loadingText === "獲取下載地址...") {
                    if (
                        pathHelper.isSharePage(this.props.location.pathname) &&
                        this.props.share &&
                        this.props.share.score > 0
                    ) {
                        this.scoreHandler(this.Download);
                        return;
                    }
                    this.Download();
                }
            }
            return;
        }
        if (this.props.modalsStatus.rename !== nextProps.modalsStatus.rename) {
            const name = nextProps.selected[0].name;
            this.setState({
                newName: name,
            });
            return;
        }
        if (
            this.props.modalsStatus.getSource !==
                nextProps.modalsStatus.getSource &&
            nextProps.modalsStatus.getSource === true
        ) {
            API.get("/file/source/" + this.props.selected[0].id)
                .then((response) => {
                    this.setState({
                        source: response.data.url,
                    });
                })
                .catch((error) => {
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        error.message,
                        "error"
                    );
                });
        }
    };

    scoreHandler = (callback) => {
        // 分享頁面需要積分下載
        if (!Auth.Check()) {
            this.props.toggleSnackbar(
                "top",
                "right",
                "登錄后才能繼續操作",
                "warning"
            );
            this.onClose();
            return;
        }
        if (!Auth.GetUser().group.shareFree && !this.downloaded) {
            this.setState({
                purchaseCallback: () => {
                    this.setState({
                        purchaseCallback: null,
                    });
                    callback();
                },
            });
        } else {
            callback();
        }
    };

    Download = () => {
        let reqURL = "";
        if (this.props.selected[0].key) {
            const downloadPath =
                this.props.selected[0].path === "/"
                    ? this.props.selected[0].path + this.props.selected[0].name
                    : this.props.selected[0].path +
                      "/" +
                      this.props.selected[0].name;
            reqURL =
                "/share/download/" +
                this.props.selected[0].key +
                "?path=" +
                encodeURIComponent(downloadPath);
        } else {
            reqURL = "/file/download/" + this.props.selected[0].id;
        }

        API.put(reqURL)
            .then((response) => {
                window.location.assign(response.data);
                this.onClose();
                this.downloaded = true;
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.onClose();
            });
    };

    archiveDownload = () => {
        const dirs = [],
            items = [];
        this.props.selected.map((value) => {
            if (value.type === "dir") {
                dirs.push(value.id);
            } else {
                items.push(value.id);
            }
            return null;
        });

        let reqURL = "/file/archive";
        const postBody = {
            items: items,
            dirs: dirs,
        };
        if (pathHelper.isSharePage(this.props.location.pathname)) {
            reqURL = "/share/archive/" + window.shareInfo.key;
            postBody["path"] = this.props.selected[0].path;
        }

        API.post(reqURL, postBody)
            .then((response) => {
                if (response.rawData.code === 0) {
                    this.onClose();
                    window.location.assign(response.data);
                } else {
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        response.rawData.msg,
                        "warning"
                    );
                }
                this.onClose();
                this.props.refreshStorage();
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.onClose();
            });
    };

    submitRemove = (e) => {
        e.preventDefault();
        this.props.setModalsLoading(true);
        const dirs = [],
            items = [];
        // eslint-disable-next-line
        this.props.selected.map((value) => {
            if (value.type === "dir") {
                dirs.push(value.id);
            } else {
                items.push(value.id);
            }
        });
        API.delete("/object", {
            data: {
                items: items,
                dirs: dirs,
            },
        })
            .then((response) => {
                if (response.rawData.code === 0) {
                    this.onClose();
                    setTimeout(this.props.refreshFileList, 500);
                } else {
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        response.rawData.msg,
                        "warning"
                    );
                }
                this.props.setModalsLoading(false);
                this.props.refreshStorage();
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.props.setModalsLoading(false);
            });
    };

    submitResave = (e) => {
        e.preventDefault();
        this.props.setModalsLoading(true);
        API.post("/share/save/" + window.shareKey, {
            path:
                this.state.selectedPath === "//"
                    ? "/"
                    : this.state.selectedPath,
        })
            .then(() => {
                this.onClose();
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    "檔案已儲存",
                    "success"
                );
                this.props.refreshFileList();
                this.props.setModalsLoading(false);
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.props.setModalsLoading(false);
            });
    };

    submitMove = (e) => {
        if (e != null) {
            e.preventDefault();
        }
        this.props.setModalsLoading(true);
        const dirs = [],
            items = [];
        // eslint-disable-next-line
        this.props.selected.map((value) => {
            if (value.type === "dir") {
                dirs.push(value.id);
            } else {
                items.push(value.id);
            }
        });
        API.patch("/object", {
            action: "move",
            src_dir: this.props.selected[0].path,
            src: {
                dirs: dirs,
                items: items,
            },
            dst: this.DragSelectedPath
                ? this.DragSelectedPath
                : this.state.selectedPath === "//"
                ? "/"
                : this.state.selectedPath,
        })
            .then(() => {
                this.onClose();
                this.props.refreshFileList();
                this.props.setModalsLoading(false);
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.props.setModalsLoading(false);
            })
            .then(() => {
                this.props.closeAllModals();
            });
    };

    dragMove = (source, target) => {
        if (this.props.selected.length === 0) {
            this.props.selected[0] = source;
        }
        let doMove = true;

        // eslint-disable-next-line
        this.props.selected.map((value) => {
            // 根據ID過濾
            if (value.id === target.id && value.type === target.type) {
                doMove = false;
                // eslint-disable-next-line
                return;
            }
            // 根據路徑過濾
            if (
                value.path ===
                target.path + (target.path === "/" ? "" : "/") + target.name
            ) {
                doMove = false;
            }
        });
        if (doMove) {
            this.DragSelectedPath =
                target.path === "/"
                    ? target.path + target.name
                    : target.path + "/" + target.name;
            this.props.openLoadingDialog("處理中...");
            this.submitMove();
        }
    };

    submitRename = (e) => {
        e.preventDefault();
        this.props.setModalsLoading(true);
        const newName = this.state.newName;

        const src = {
            dirs: [],
            items: [],
        };

        if (this.props.selected[0].type === "dir") {
            src.dirs[0] = this.props.selected[0].id;
        } else {
            src.items[0] = this.props.selected[0].id;
        }

        // 檢查重名
        if (
            this.props.dirList.findIndex((value) => {
                return value.name === newName;
            }) !== -1 ||
            this.props.fileList.findIndex((value) => {
                return value.name === newName;
            }) !== -1
        ) {
            this.props.toggleSnackbar(
                "top",
                "right",
                "新名稱與已有檔案重複",
                "warning"
            );
            this.props.setModalsLoading(false);
        } else {
            API.post("/object/rename", {
                action: "rename",
                src: src,
                new_name: newName,
            })
                .then(() => {
                    this.onClose();
                    this.props.refreshFileList();
                    this.props.setModalsLoading(false);
                })
                .catch((error) => {
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        error.message,
                        "error"
                    );
                    this.props.setModalsLoading(false);
                });
        }
    };

    submitCreateNewFolder = (e) => {
        e.preventDefault();
        this.props.setModalsLoading(true);
        if (
            this.props.dirList.findIndex((value) => {
                return value.name === this.state.newFolderName;
            }) !== -1
        ) {
            this.props.toggleSnackbar(
                "top",
                "right",
                "資料夾名稱重複",
                "warning"
            );
            this.props.setModalsLoading(false);
        } else {
            API.put("/directory", {
                path:
                    (this.props.path === "/" ? "" : this.props.path) +
                    "/" +
                    this.state.newFolderName,
            })
                .then(() => {
                    this.onClose();
                    this.props.refreshFileList();
                    this.props.setModalsLoading(false);
                })
                .catch((error) => {
                    this.props.setModalsLoading(false);

                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        error.message,
                        "error"
                    );
                });
        }
        //this.props.toggleSnackbar();
    };

    submitCreateNewFile = (e) => {
        e.preventDefault();
        this.props.setModalsLoading(true);
        if (
            this.props.dirList.findIndex((value) => {
                return value.name === this.state.newFileName;
            }) !== -1
        ) {
            this.props.toggleSnackbar(
                "top",
                "right",
                "檔名稱重複",
                "warning"
            );
            this.props.setModalsLoading(false);
        } else {
            API.post("/file/create", {
                path:
                    (this.props.path === "/" ? "" : this.props.path) +
                    "/" +
                    this.state.newFileName,
            })
                .then(() => {
                    this.onClose();
                    this.props.refreshFileList();
                    this.props.setModalsLoading(false);
                })
                .catch((error) => {
                    this.props.setModalsLoading(false);

                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        error.message,
                        "error"
                    );
                });
        }
        //this.props.toggleSnackbar();
    };

    submitTorrentDownload = (e) => {
        e.preventDefault();
        this.props.setModalsLoading(true);
        API.post("/aria2/torrent/" + this.props.selected[0].id, {
            dst:
                this.state.selectedPath === "//"
                    ? "/"
                    : this.state.selectedPath,
        })
            .then(() => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    "任務已建立",
                    "success"
                );
                this.onClose();
                this.props.setModalsLoading(false);
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.props.setModalsLoading(false);
            });
    };

    submitDownload = (e) => {
        e.preventDefault();
        this.props.setModalsLoading(true);
        API.post("/aria2/url", {
            url: this.state.downloadURL,
            dst:
                this.state.selectedPath === "//"
                    ? "/"
                    : this.state.selectedPath,
        })
            .then(() => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    "任務已建立",
                    "success"
                );
                this.onClose();
                this.props.setModalsLoading(false);
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.props.setModalsLoading(false);
            });
    };

    setMoveTarget = (folder) => {
        const path =
            folder.path === "/"
                ? folder.path + folder.name
                : folder.path + "/" + folder.name;
        this.setState({
            selectedPath: path,
            selectedPathName: folder.name,
        });
    };

    remoteDownloadNext = () => {
        this.props.closeAllModals();
        this.setState({
            remoteDownloadPathSelect: true,
        });
    };

    onClose = () => {
        this.setState({
            newFolderName: "",
            newFileName: "",
            newName: "",
            selectedPath: "",
            selectedPathName: "",
            secretShare: false,
            sharePwd: "",
            downloadURL: "",
            shareUrl: "",
            remoteDownloadPathSelect: false,
            source: "",
        });
        this.newNameSuffix = "";
        this.props.closeAllModals();
    };

    handleChange = (name) => (event) => {
        this.setState({ [name]: event.target.checked });
    };

    render() {
        const { classes } = this.props;

        return (
            <div>
                <Loading />
                <PurchaseShareDialog
                    callback={this.state.purchaseCallback}
                    score={this.props.share ? this.props.share.score : 0}
                    onClose={() => {
                        this.setState({ purchaseCallback: null });
                        this.onClose();
                    }}
                />
                <Dialog
                    open={this.props.modalsStatus.getSource}
                    onClose={this.onClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">
                        獲取檔案外鏈
                    </DialogTitle>

                    <DialogContent>
                        <form onSubmit={this.submitCreateNewFolder}>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="newFolderName"
                                label="外鏈地址"
                                type="text"
                                value={this.state.source}
                                fullWidth
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onClose}>關閉</Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.props.modalsStatus.createNewFolder}
                    onClose={this.onClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">新建資料夾</DialogTitle>

                    <DialogContent>
                        <form onSubmit={this.submitCreateNewFolder}>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="newFolderName"
                                label="資料夾名稱"
                                type="text"
                                value={this.state.newFolderName}
                                onChange={(e) => this.handleInputChange(e)}
                                fullWidth
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onClose}>取消</Button>
                        <div className={classes.wrapper}>
                            <Button
                                onClick={this.submitCreateNewFolder}
                                color="primary"
                                disabled={
                                    this.state.newFolderName === "" ||
                                    this.props.modalsLoading
                                }
                            >
                                建立
                                {this.props.modalsLoading && (
                                    <CircularProgress
                                        size={24}
                                        className={classes.buttonProgress}
                                    />
                                )}
                            </Button>
                        </div>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={this.props.modalsStatus.createNewFile}
                    onClose={this.onClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">新建檔案</DialogTitle>

                    <DialogContent>
                        <form onSubmit={this.submitCreateNewFile}>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="newFileName"
                                label="檔名稱"
                                type="text"
                                value={this.state.newFileName}
                                onChange={(e) => this.handleInputChange(e)}
                                fullWidth
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onClose}>取消</Button>
                        <div className={classes.wrapper}>
                            <Button
                                onClick={this.submitCreateNewFile}
                                color="primary"
                                disabled={
                                    this.state.newFileName === "" ||
                                    this.props.modalsLoading
                                }
                            >
                                建立
                                {this.props.modalsLoading && (
                                    <CircularProgress
                                        size={24}
                                        className={classes.buttonProgress}
                                    />
                                )}
                            </Button>
                        </div>
                    </DialogActions>
                </Dialog>

                <Dialog
                    open={this.props.modalsStatus.rename}
                    onClose={this.onClose}
                    aria-labelledby="form-dialog-title"
                    maxWidth="sm"
                    fullWidth={true}
                >
                    <DialogTitle id="form-dialog-title">重新命名</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            輸入{" "}
                            <strong>
                                {this.props.selected.length === 1
                                    ? this.props.selected[0].name
                                    : ""}
                            </strong>{" "}
                            的新名稱：
                        </DialogContentText>
                        <form onSubmit={this.submitRename}>
                            <TextField
                                autoFocus
                                margin="dense"
                                id="newName"
                                label="新名稱"
                                type="text"
                                value={this.state.newName}
                                onChange={(e) => this.handleInputChange(e)}
                                fullWidth
                            />
                        </form>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onClose}>取消</Button>
                        <div className={classes.wrapper}>
                            <Button
                                onClick={this.submitRename}
                                color="primary"
                                disabled={
                                    this.state.newName === "" ||
                                    this.props.modalsLoading
                                }
                            >
                                確定
                                {this.props.modalsLoading && (
                                    <CircularProgress
                                        size={24}
                                        className={classes.buttonProgress}
                                    />
                                )}
                            </Button>
                        </div>
                    </DialogActions>
                </Dialog>
                <CopyDialog
                    open={this.props.modalsStatus.copy}
                    onClose={this.onClose}
                    presentPath={this.props.path}
                    selected={this.props.selected}
                    modalsLoading={this.props.modalsLoading}
                />

                <Dialog
                    open={this.props.modalsStatus.move}
                    onClose={this.onClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">移動至</DialogTitle>
                    <PathSelector
                        presentPath={this.props.path}
                        selected={this.props.selected}
                        onSelect={this.setMoveTarget}
                    />

                    {this.state.selectedPath !== "" && (
                        <DialogContent className={classes.contentFix}>
                            <DialogContentText>
                                移動至{" "}
                                <strong>{this.state.selectedPathName}</strong>
                            </DialogContentText>
                        </DialogContent>
                    )}
                    <DialogActions>
                        <Button onClick={this.onClose}>取消</Button>
                        <div className={classes.wrapper}>
                            <Button
                                onClick={this.submitMove}
                                color="primary"
                                disabled={
                                    this.state.selectedPath === "" ||
                                    this.props.modalsLoading
                                }
                            >
                                確定
                                {this.props.modalsLoading && (
                                    <CircularProgress
                                        size={24}
                                        className={classes.buttonProgress}
                                    />
                                )}
                            </Button>
                        </div>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.props.modalsStatus.resave}
                    onClose={this.onClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">儲存至</DialogTitle>
                    <PathSelector
                        presentPath={this.props.path}
                        selected={this.props.selected}
                        onSelect={this.setMoveTarget}
                    />

                    {this.state.selectedPath !== "" && (
                        <DialogContent className={classes.contentFix}>
                            <DialogContentText>
                                儲存至{" "}
                                <strong>{this.state.selectedPathName}</strong>
                            </DialogContentText>
                        </DialogContent>
                    )}
                    <DialogActions>
                        <Button onClick={this.onClose}>取消</Button>
                        <div className={classes.wrapper}>
                            <Button
                                onClick={this.submitResave}
                                color="primary"
                                disabled={
                                    this.state.selectedPath === "" ||
                                    this.props.modalsLoading
                                }
                            >
                                確定
                                {this.props.modalsLoading && (
                                    <CircularProgress
                                        size={24}
                                        className={classes.buttonProgress}
                                    />
                                )}
                            </Button>
                        </div>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.props.modalsStatus.remove}
                    onClose={this.onClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">刪除對像</DialogTitle>

                    <DialogContent>
                        <DialogContentText>
                            確定要刪除
                            {this.props.selected.length === 1 && (
                                <strong> {this.props.selected[0].name} </strong>
                            )}
                            {this.props.selected.length > 1 && (
                                <span>
                                    這{this.props.selected.length}個對象
                                </span>
                            )}
                            嗎？
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onClose}>取消</Button>
                        <div className={classes.wrapper}>
                            <Button
                                onClick={this.submitRemove}
                                color="primary"
                                disabled={this.props.modalsLoading}
                            >
                                確定
                                {this.props.modalsLoading && (
                                    <CircularProgress
                                        size={24}
                                        className={classes.buttonProgress}
                                    />
                                )}
                            </Button>
                        </div>
                    </DialogActions>
                </Dialog>

                <CreatShare
                    open={this.props.modalsStatus.share}
                    onClose={this.onClose}
                    modalsLoading={this.props.modalsLoading}
                    setModalsLoading={this.props.setModalsLoading}
                    selected={this.props.selected}
                />

                <Dialog
                    open={this.props.modalsStatus.music}
                    onClose={this.onClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">音訊播放</DialogTitle>

                    <DialogContent>
                        <DialogContentText>
                            {this.props.selected.length !== 0 && (
                                <audio
                                    controls
                                    src={
                                        pathHelper.isSharePage(
                                            this.props.location.pathname
                                        )
                                            ? baseURL +
                                              "/share/preview/" +
                                              this.props.selected[0].key +
                                              (this.props.selected[0].key
                                                  ? "?path=" +
                                                    encodeURIComponent(
                                                        this.props.selected[0]
                                                            .path === "/"
                                                            ? this.props
                                                                  .selected[0]
                                                                  .path +
                                                                  this.props
                                                                      .selected[0]
                                                                      .name
                                                            : this.props
                                                                  .selected[0]
                                                                  .path +
                                                                  "/" +
                                                                  this.props
                                                                      .selected[0]
                                                                      .name
                                                    )
                                                  : "")
                                            : baseURL +
                                              "/file/preview/" +
                                              this.props.selected[0].id
                                    }
                                />
                            )}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onClose}>關閉</Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.props.modalsStatus.remoteDownload}
                    onClose={this.onClose}
                    aria-labelledby="form-dialog-title"
                    fullWidth
                >
                    <DialogTitle id="form-dialog-title">
                        新建離線下載任務
                    </DialogTitle>

                    <DialogContent>
                        <DialogContentText>
                            <TextField
                                label="檔案地址"
                                autoFocus
                                fullWidth
                                id="downloadURL"
                                onChange={this.handleInputChange}
                                placeholder="輸入檔案下載地址，支援 HTTP(s)/FTP/磁力鏈"
                            />
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.onClose}>關閉</Button>
                        <Button
                            onClick={this.remoteDownloadNext}
                            color="primary"
                            disabled={
                                this.props.modalsLoading ||
                                this.state.downloadURL === ""
                            }
                        >
                            下一步
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.state.remoteDownloadPathSelect}
                    onClose={this.onClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">
                        選擇儲存位置
                    </DialogTitle>
                    <PathSelector
                        presentPath={this.props.path}
                        selected={this.props.selected}
                        onSelect={this.setMoveTarget}
                    />

                    {this.state.selectedPath !== "" && (
                        <DialogContent className={classes.contentFix}>
                            <DialogContentText>
                                下載至{" "}
                                <strong>{this.state.selectedPathName}</strong>
                            </DialogContentText>
                        </DialogContent>
                    )}
                    <DialogActions>
                        <Button onClick={this.onClose}>取消</Button>
                        <div className={classes.wrapper}>
                            <Button
                                onClick={this.submitDownload}
                                color="primary"
                                disabled={
                                    this.state.selectedPath === "" ||
                                    this.props.modalsLoading
                                }
                            >
                                建立任務
                                {this.props.modalsLoading && (
                                    <CircularProgress
                                        size={24}
                                        className={classes.buttonProgress}
                                    />
                                )}
                            </Button>
                        </div>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.props.modalsStatus.torrentDownload}
                    onClose={this.onClose}
                    aria-labelledby="form-dialog-title"
                >
                    <DialogTitle id="form-dialog-title">
                        選擇儲存位置
                    </DialogTitle>
                    <PathSelector
                        presentPath={this.props.path}
                        selected={this.props.selected}
                        onSelect={this.setMoveTarget}
                    />

                    {this.state.selectedPath !== "" && (
                        <DialogContent className={classes.contentFix}>
                            <DialogContentText>
                                下載至{" "}
                                <strong>{this.state.selectedPathName}</strong>
                            </DialogContentText>
                        </DialogContent>
                    )}
                    <DialogActions>
                        <Button onClick={this.onClose}>取消</Button>
                        <div className={classes.wrapper}>
                            <Button
                                onClick={this.submitTorrentDownload}
                                color="primary"
                                disabled={
                                    this.state.selectedPath === "" ||
                                    this.props.modalsLoading
                                }
                            >
                                建立任務
                                {this.props.modalsLoading && (
                                    <CircularProgress
                                        size={24}
                                        className={classes.buttonProgress}
                                    />
                                )}
                            </Button>
                        </div>
                    </DialogActions>
                </Dialog>

                <DecompressDialog
                    open={this.props.modalsStatus.decompress}
                    onClose={this.onClose}
                    presentPath={this.props.path}
                    selected={this.props.selected}
                    modalsLoading={this.props.modalsLoading}
                />
                <CompressDialog
                    open={this.props.modalsStatus.compress}
                    onClose={this.onClose}
                    presentPath={this.props.path}
                    selected={this.props.selected}
                    modalsLoading={this.props.modalsLoading}
                />
                <RelocateDialog
                    open={this.props.modalsStatus.relocate}
                    onClose={this.onClose}
                    selected={this.props.selected}
                    modalsLoading={this.props.modalsLoading}
                />
            </div>
        );
    }
}

ModalsCompoment.propTypes = {
    classes: PropTypes.object.isRequired,
};

const Modals = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(withRouter(ModalsCompoment)));

export default Modals;
