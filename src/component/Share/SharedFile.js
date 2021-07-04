import React, { Component } from "react";
import { connect } from "react-redux";
import { sizeToString, vhCheck } from "../../utils";
import {
    openMusicDialog,
    openResaveDialog,
    setSelectedTarget,
    showImgPreivew,
    toggleSnackbar,
} from "../../actions";
import { isPreviewable } from "../../config";
import { withStyles, Button, Typography } from "@material-ui/core";
import Divider from "@material-ui/core/Divider";
import TypeIcon from "../FileManager/TypeIcon";
import Auth from "../../middleware/Auth";
import PurchaseShareDialog from "../Modals/PurchaseShare";
import API from "../../middleware/Api";
import { withRouter } from "react-router-dom";
import Creator from "./Creator";
import pathHelper from "../../utils/page";
import Report from "../Modals/Report";

vhCheck();
const styles = (theme) => ({
    layout: {
        width: "auto",
        marginTop: "90px",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 1100,
            marginTop: "90px",
            marginLeft: "auto",
            marginRight: "auto",
        },
        [theme.breakpoints.down("sm")]: {
            marginTop: 0,
            marginLeft: 0,
            marginRight: 0,
        },
        justifyContent: "center",
        display: "flex",
    },
    player: {
        borderRadius: "4px",
    },
    fileCotainer: {
        width: "200px",
        margin: "0 auto",
    },
    buttonCotainer: {
        width: "400px",
        margin: "0 auto",
        textAlign: "center",
        marginTop: "20px",
    },
    paper: {
        padding: theme.spacing(2),
    },
    icon: {
        borderRadius: "10%",
        marginTop: 2,
    },

    box: {
        width: "100%",
        maxWidth: 440,
        backgroundColor: theme.palette.background.paper,
        borderRadius: 12,
        boxShadow: "0 8px 16px rgba(29,39,55,.25)",
        [theme.breakpoints.down("sm")]: {
            height: "calc(var(--vh, 100vh) - 56px)",
            borderRadius: 0,
            maxWidth: 1000,
        },
        display: "flex",
        flexDirection: "column",
    },
    boxContent: {
        padding: 24,
        display: "flex",
        flex: "1",
    },
    fileName: {
        marginLeft: 20,
    },
    fileSize: {
        color: theme.palette.text.disabled,
        fontSize: 14,
    },
    boxFooter: {
        display: "flex",
        padding: "20px 16px",
        justifyContent: "space-between",
    },
    downloadButton: {
        marginLeft: 8,
    },
});
const mapStateToProps = () => {
    return {};
};

const mapDispatchToProps = (dispatch) => {
    return {
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        },
        openMusicDialog: () => {
            dispatch(openMusicDialog());
        },
        setSelectedTarget: (targets) => {
            dispatch(setSelectedTarget(targets));
        },
        showImgPreivew: (first) => {
            dispatch(showImgPreivew(first));
        },
        openResave: (key) => {
            dispatch(openResaveDialog(key));
        },
    };
};

const Modals = React.lazy(() => import("../FileManager/Modals"));
const ImgPreview = React.lazy(() => import("../FileManager/ImgPreview"));

class SharedFileCompoment extends Component {
    state = {
        anchorEl: null,
        open: false,
        purchaseCallback: null,
        loading: false,
        openReport: false,
    };

    downloaded = false;

    // TODO merge into react thunk
    preview = () => {
        if (pathHelper.isSharePage(this.props.location.pathname)) {
            const user = Auth.GetUser();
            if (!Auth.Check() && user && !user.group.shareDownload) {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    "請先登錄",
                    "warning"
                );
                return;
            }
        }

        switch (isPreviewable(this.props.share.source.name)) {
            case "img":
                this.props.showImgPreivew({
                    key: this.props.share.key,
                    name: this.props.share.source.name,
                });
                return;
            case "msDoc":
                this.props.history.push(
                    this.props.share.key +
                        "/doc?name=" +
                        encodeURIComponent(this.props.share.source.name)
                );
                return;
            case "audio":
                this.props.setSelectedTarget([
                    {
                        key: this.props.share.key,
                        type: "share",
                    },
                ]);
                this.props.openMusicDialog();
                return;
            case "video":
                this.props.history.push(
                    this.props.share.key +
                        "/video?name=" +
                        encodeURIComponent(this.props.share.source.name)
                );
                return;
            case "edit":
                this.props.history.push(
                    this.props.share.key +
                        "/text?name=" +
                        encodeURIComponent(this.props.share.source.name)
                );
                return;
            case "pdf":
                this.props.history.push(
                    this.props.share.key +
                        "/pdf?name=" +
                        encodeURIComponent(this.props.share.source.name)
                );
                return;
            case "code":
                this.props.history.push(
                    this.props.share.key +
                        "/code?name=" +
                        encodeURIComponent(this.props.share.source.name)
                );
                return;
            default:
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    "此檔案無法預覽",
                    "warning"
                );
                return;
        }
    };

    componentWillUnmount() {
        this.props.setSelectedTarget([]);
    }

    scoreHandle = (callback) => (event) => {
        if (this.props.share.score > 0) {
            if (!Auth.Check()) {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    "登錄后才能繼續操作",
                    "warning"
                );
                return;
            }
            if (!Auth.GetUser().group.shareFree && !this.downloaded) {
                this.setState({
                    purchaseCallback: () => {
                        this.setState({
                            purchaseCallback: null,
                        });
                        callback(event);
                    },
                });
                return;
            }
        }
        callback(event);
    };

    download = () => {
        this.setState({ loading: true });
        API.put("/share/download/" + this.props.share.key)
            .then((response) => {
                this.downloaded = true;
                window.location.assign(response.data);
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "warning"
                );
            })
            .then(() => {
                this.setState({ loading: false });
            });
    };

    render() {
        const { classes } = this.props;
        const user = Auth.GetUser();
        const isLogin = Auth.Check();

        return (
            <div className={classes.layout}>
                <Modals />
                <ImgPreview />
                <PurchaseShareDialog
                    callback={this.state.purchaseCallback}
                    score={this.props.share.score}
                    onClose={() => this.setState({ purchaseCallback: null })}
                />
                <Report
                    open={this.state.openReport}
                    share={this.props.share}
                    onClose={() => this.setState({ openReport: false })}
                />
                <div className={classes.box}>
                    <Creator share={this.props.share} />
                    <Divider />
                    <div className={classes.boxContent}>
                        <TypeIcon
                            className={classes.icon}
                            isUpload
                            fileName={this.props.share.source.name}
                        />
                        <div className={classes.fileName}>
                            <Typography style={{ wordBreak: "break-all" }}>
                                {this.props.share.source.name}
                            </Typography>
                            <Typography className={classes.fileSize}>
                                {sizeToString(this.props.share.source.size)}
                            </Typography>
                        </div>
                    </div>
                    <Divider />
                    <div className={classes.boxFooter}>
                        <div className={classes.actionLeft}>
                            <Button
                                onClick={() =>
                                    this.props.openResave(this.props.share.key)
                                }
                                color="secondary"
                            >
                                儲存到我的檔案
                            </Button>
                            <Button
                                onClick={() =>
                                    this.setState({ openReport: true })
                                }
                                color="secondary"
                            >
                                舉報
                            </Button>
                        </div>
                        <div className={classes.actions}>
                            {this.props.share.preview && (
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={this.scoreHandle(this.preview)}
                                    disabled={this.state.loading}
                                >
                                    預覽
                                </Button>
                            )}
                            <Button
                                variant="contained"
                                color="secondary"
                                className={classes.downloadButton}
                                onClick={this.scoreHandle(this.download)}
                                disabled={this.state.loading}
                            >
                                下載
                                {this.props.share.score > 0 &&
                                    (!isLogin || !user.group.shareFree) &&
                                    " (" + this.props.share.score + "積分)"}
                                {this.props.share.score > 0 &&
                                    isLogin &&
                                    user.group.shareFree &&
                                    " (免積分)"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const SharedFile = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(withRouter(SharedFileCompoment)));

export default SharedFile;