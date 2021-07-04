import React, { Component } from "react";
import { connect } from "react-redux";
import PhotoIcon from "@material-ui/icons/InsertPhoto";
import GroupIcon from "@material-ui/icons/Group";
import DateIcon from "@material-ui/icons/DateRange";
import EmailIcon from "@material-ui/icons/Email";
import HomeIcon from "@material-ui/icons/Home";
import LinkIcon from "@material-ui/icons/Phonelink";
import AlarmOff from "@material-ui/icons/AlarmOff";
import InputIcon from "@material-ui/icons/Input";
import SecurityIcon from "@material-ui/icons/Security";
import NickIcon from "@material-ui/icons/PermContactCalendar";
import LockIcon from "@material-ui/icons/Lock";
import VerifyIcon from "@material-ui/icons/VpnKey";
import ColorIcon from "@material-ui/icons/Palette";
import {
    applyThemes,
    changeViewMethod,
    toggleDaylightMode,
    toggleSnackbar,
} from "../../actions";
import axios from "axios";
import FingerprintIcon from "@material-ui/icons/Fingerprint";
import ToggleButton from "@material-ui/lab/ToggleButton";
import ToggleButtonGroup from "@material-ui/lab/ToggleButtonGroup";
import RightIcon from "@material-ui/icons/KeyboardArrowRight";
import {
    ListItemIcon,
    withStyles,
    Button,
    Divider,
    TextField,
    Avatar,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    ListItemAvatar,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Switch,
} from "@material-ui/core";
import Backup from "@material-ui/icons/Backup";
import SettingsInputHdmi from "@material-ui/icons/SettingsInputHdmi";
import { blue, green, yellow } from "@material-ui/core/colors";
import API from "../../middleware/Api";
import Auth from "../../middleware/Auth";
import { withRouter } from "react-router";
import TimeAgo from "timeago-react";
import QRCode from "qrcode-react";
import {
    Brightness3,
    Check,
    ConfirmationNumber,
    ListAlt,
    PermContactCalendar,
} from "@material-ui/icons";
import { transformTime } from "../../utils";
import Authn from "./Authn";
import Tooltip from "@material-ui/core/Tooltip";

const styles = (theme) => ({
    layout: {
        width: "auto",
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(1100 + theme.spacing(3) * 2)]: {
            width: 700,
            marginLeft: "auto",
            marginRight: "auto",
        },
    },
    sectionTitle: {
        paddingBottom: "10px",
        paddingTop: "30px",
    },
    rightIcon: {
        marginTop: "4px",
        marginRight: "10px",
        color: theme.palette.text.secondary,
    },
    uploadFromFile: {
        backgroundColor: blue[100],
        color: blue[600],
    },
    userGravatar: {
        backgroundColor: yellow[100],
        color: yellow[800],
    },
    policySelected: {
        backgroundColor: green[100],
        color: green[800],
    },
    infoText: {
        marginRight: "17px",
    },
    infoTextWithIcon: {
        marginRight: "17px",
        marginTop: "1px",
    },
    rightIconWithText: {
        marginTop: "0px",
        marginRight: "10px",
        color: theme.palette.text.secondary,
    },
    iconFix: {
        marginRight: "11px",
        marginLeft: "7px",
        minWidth: 40,
    },
    flexContainer: {
        display: "flex",
    },
    desenList: {
        paddingTop: 0,
        paddingBottom: 0,
    },
    flexContainerResponse: {
        display: "flex",
        [theme.breakpoints.down("sm")]: {
            display: "initial",
        },
    },
    desText: {
        marginTop: "10px",
    },
    secondColor: {
        height: "20px",
        width: "20px",
        backgroundColor: theme.palette.secondary.main,
        borderRadius: "50%",
        marginRight: "17px",
    },
    firstColor: {
        height: "20px",
        width: "20px",
        backgroundColor: theme.palette.primary.main,
        borderRadius: "50%",
        marginRight: "6px",
    },
    themeBlock: {
        height: "20px",
        width: "20px",
    },
    paddingBottom: {
        marginBottom: "30px",
    },
    paddingText: {
        paddingRight: theme.spacing(2),
    },
    qrcode: {
        width: 128,
        marginTop: 16,
        marginRight: 16,
    },
});

const mapStateToProps = (state) => {
    return {
        title: state.siteConfig.title,
        authn: state.siteConfig.authn,
        viewMethod: state.viewUpdate.explorerViewMethod,
    };
};

const mapDispatchToProps = (dispatch) => {
    return {
        toggleSnackbar: (vertical, horizontal, msg, color) => {
            dispatch(toggleSnackbar(vertical, horizontal, msg, color));
        },
        applyThemes: (color) => {
            dispatch(applyThemes(color));
        },
        toggleDaylightMode: () => {
            dispatch(toggleDaylightMode());
        },
        changeView: (method) => {
            dispatch(changeViewMethod(method));
        },
    };
};

class UserSettingCompoment extends Component {
    constructor(props) {
        super(props);
        this.fileInput = React.createRef();
    }

    state = {
        avatarModal: false,
        nickModal: false,
        changePassword: false,
        loading: "",
        oldPwd: "",
        newPwd: "",
        webdavPwd: "",
        newPwdRepeat: "",
        twoFactor: false,
        authCode: "",
        changeTheme: false,
        chosenTheme: null,
        showWebDavUrl: false,
        showWebDavUserName: false,
        changeWebDavPwd: false,
        groupBackModal: false,
        changePolicy: false,
        settings: {
            uid: 0,
            group_expires: 0,
            policy: {
                current: {
                    name: "-",
                    id: "",
                },
                options: [],
            },
            qq: "",
            homepage: true,
            two_factor: "",
            two_fa_secret: "",
            prefer_theme: "",
            themes: {},
            authn: [],
        },
    };

    handleClose = () => {
        this.setState({
            avatarModal: false,
            nickModal: false,
            changePassword: false,
            loading: "",
            twoFactor: false,
            changeTheme: false,
            showWebDavUrl: false,
            showWebDavUserName: false,
            changeWebDavPwd: false,
            groupBackModal: false,
            changePolicy: false,
        });
    };

    componentDidMount() {
        this.loadSetting();
    }

    toggleViewMethod = () => {
        const newMethod =
            this.props.viewMethod === "icon"
                ? "list"
                : this.props.viewMethod === "list"
                ? "smallIcon"
                : "icon";
        Auth.SetPreference("view_method", newMethod);
        this.props.changeView(newMethod);
    };

    loadSetting = () => {
        API.get("/user/setting")
            .then((response) => {
                const theme = JSON.parse(response.data.themes);
                response.data.themes = theme;
                this.setState({
                    settings: response.data,
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
    };

    doChangeGroup = () => {
        API.patch("/user/setting/vip", {})
            .then(() => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    "解約成功，更改會在數分鐘後生效",
                    "success"
                );
                this.handleClose();
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
            });
    };

    useGravatar = () => {
        this.setState({
            loading: "gravatar",
        });
        API.put("/user/setting/avatar")
            .then(() => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    "頭像已更新，重新整理後生效",
                    "success"
                );
                this.setState({
                    loading: "",
                });
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.setState({
                    loading: "",
                });
            });
    };

    changePolicy = (id) => {
        API.patch("/user/setting/policy", {
            id: id,
        })
            .then(() => {
                window.location.reload();
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.setState({
                    loading: "",
                });
            });
    };

    changeNick = () => {
        this.setState({
            loading: "nick",
        });
        API.patch("/user/setting/nick", {
            nick: this.state.nick,
        })
            .then(() => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    "昵稱已更改，重新整理後生效",
                    "success"
                );
                this.setState({
                    loading: "",
                });
                this.handleClose();
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.setState({
                    loading: "",
                });
            });
    };

    bindQQ = () => {
        this.setState({
            loading: "nick",
        });
        API.patch("/user/setting/qq", {})
            .then((response) => {
                if (response.data === "") {
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        "已解除與QQ賬戶的關聯",
                        "success"
                    );
                    this.setState({
                        settings: {
                            ...this.state.settings,
                            qq: false,
                        },
                    });
                } else {
                    window.location.href = response.data;
                }
                this.handleClose();
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
            })
            .then(() => {
                this.setState({
                    loading: "",
                });
            });
    };

    uploadAvatar = () => {
        this.setState({
            loading: "avatar",
        });
        const formData = new FormData();
        formData.append("avatar", this.fileInput.current.files[0]);
        API.post("/user/setting/avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        })
            .then(() => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    "頭像已更新，重新整理後生效",
                    "success"
                );
                this.setState({
                    loading: "",
                });
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.setState({
                    loading: "",
                });
            });
    };

    handleToggle = () => {
        API.patch("/user/setting/homepage", {
            status: !this.state.settings.homepage,
        })
            .then(() => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    "設定已儲存",
                    "success"
                );
                this.setState({
                    settings: {
                        ...this.state.settings,
                        homepage: !this.state.settings.homepage,
                    },
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
    };

    changhePwd = () => {
        if (this.state.newPwd !== this.state.newPwdRepeat) {
            this.props.toggleSnackbar(
                "top",
                "right",
                "兩次密碼輸入不一致",
                "warning"
            );
            return;
        }
        this.setState({
            loading: "changePassword",
        });
        API.patch("/user/setting/password", {
            old: this.state.oldPwd,
            new: this.state.newPwd,
        })
            .then(() => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    "密碼已更新",
                    "success"
                );
                this.setState({
                    loading: "",
                });
                this.handleClose();
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.setState({
                    loading: "",
                });
            });
    };

    changeTheme = () => {
        this.setState({
            loading: "changeTheme",
        });
        API.patch("/user/setting/theme", {
            theme: this.state.chosenTheme,
        })
            .then(() => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    "主題配色已更換",
                    "success"
                );
                this.props.applyThemes(this.state.chosenTheme);
                this.setState({
                    loading: "",
                });
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.setState({
                    loading: "",
                });
            });
    };

    changheWebdavPwd = () => {
        this.setState({
            loading: "changheWebdavPwd",
        });
        axios
            .post("/Member/setWebdavPwd", {
                pwd: this.state.webdavPwd,
            })
            .then((response) => {
                if (response.data.error === "1") {
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        response.data.msg,
                        "error"
                    );
                    this.setState({
                        loading: "",
                    });
                } else {
                    this.props.toggleSnackbar(
                        "top",
                        "right",
                        response.data.msg,
                        "success"
                    );
                    this.setState({
                        loading: "",
                        changeWebDavPwd: false,
                    });
                }
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.setState({
                    loading: "",
                });
            });
    };

    init2FA = () => {
        if (this.state.settings.two_factor) {
            this.setState({ twoFactor: true });
            return;
        }
        API.get("/user/setting/2fa")
            .then((response) => {
                this.setState({
                    two_fa_secret: response.data,
                    twoFactor: true,
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
    };

    twoFactor = () => {
        this.setState({
            loading: "twoFactor",
        });
        API.patch("/user/setting/2fa", {
            code: this.state.authCode,
        })
            .then(() => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    "設定已儲存",
                    "success"
                );
                this.setState({
                    loading: "",
                    settings: {
                        ...this.state.settings,
                        two_factor: !this.state.settings.two_factor,
                    },
                });
                this.handleClose();
            })
            .catch((error) => {
                this.props.toggleSnackbar(
                    "top",
                    "right",
                    error.message,
                    "error"
                );
                this.setState({
                    loading: "",
                });
            });
    };

    handleChange = (name) => (event) => {
        this.setState({ [name]: event.target.value });
    };

    handleAlignment = (event, chosenTheme) => this.setState({ chosenTheme });

    toggleThemeMode = (current) => {
        if (current !== null) {
            this.props.toggleDaylightMode();
            Auth.SetPreference("theme_mode", null);
        }
    };

    render() {
        const { classes } = this.props;
        const user = Auth.GetUser();
        const dark = Auth.GetPreference("theme_mode");

        return (
            <div>
                <div className={classes.layout}>
                    <Typography
                        className={classes.sectionTitle}
                        variant="subtitle2"
                    >
                        個人資料
                    </Typography>
                    <Paper>
                        <List className={classes.desenList}>
                            <ListItem
                                button
                                onClick={() =>
                                    this.setState({ avatarModal: true })
                                }
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        src={
                                            "/api/v3/user/avatar/" +
                                            user.id +
                                            "/l"
                                        }
                                    />
                                </ListItemAvatar>
                                <ListItemText primary="頭像" />
                                <ListItemSecondaryAction>
                                    <RightIcon className={classes.rightIcon} />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem button>
                                <ListItemIcon className={classes.iconFix}>
                                    <PermContactCalendar />
                                </ListItemIcon>
                                <ListItemText primary="UID" />

                                <ListItemSecondaryAction>
                                    <Typography
                                        className={classes.infoTextWithIcon}
                                        color="textSecondary"
                                    >
                                        {this.state.settings.uid}
                                    </Typography>
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem
                                button
                                onClick={() =>
                                    this.setState({ nickModal: true })
                                }
                            >
                                <ListItemIcon className={classes.iconFix}>
                                    <NickIcon />
                                </ListItemIcon>
                                <ListItemText primary="昵稱" />

                                <ListItemSecondaryAction
                                    onClick={() =>
                                        this.setState({ nickModal: true })
                                    }
                                    className={classes.flexContainer}
                                >
                                    <Typography
                                        className={classes.infoTextWithIcon}
                                        color="textSecondary"
                                    >
                                        {user.nickname}
                                    </Typography>
                                    <RightIcon
                                        className={classes.rightIconWithText}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem button>
                                <ListItemIcon className={classes.iconFix}>
                                    <EmailIcon />
                                </ListItemIcon>
                                <ListItemText primary="Email" />

                                <ListItemSecondaryAction>
                                    <Typography
                                        className={classes.infoText}
                                        color="textSecondary"
                                    >
                                        {user.user_name}
                                    </Typography>
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem
                                button
                                onClick={() =>
                                    this.props.history.push("/buy?tab=1")
                                }
                            >
                                <ListItemIcon className={classes.iconFix}>
                                    <GroupIcon />
                                </ListItemIcon>
                                <ListItemText primary="使用者組" />

                                <ListItemSecondaryAction>
                                    <Typography
                                        className={classes.infoText}
                                        color="textSecondary"
                                    >
                                        {user.group.name}
                                        {this.state.settings.group_expires >
                                            0 && (
                                            <span>
                                                {" "}
                                                <Tooltip
                                                    title={transformTime(
                                                        this.state.settings
                                                            .group_expires *
                                                            1000
                                                    )}
                                                >
                                                    <TimeAgo
                                                        datetime={
                                                            this.state.settings
                                                                .group_expires +
                                                            "000"
                                                        }
                                                        locale="zh_CN"
                                                    />
                                                </Tooltip>{" "}
                                                過期
                                            </span>
                                        )}
                                    </Typography>
                                </ListItemSecondaryAction>
                            </ListItem>
                            {this.state.settings.group_expires > 0 && (
                                <div>
                                    <Divider />
                                    <ListItem
                                        button
                                        onClick={() =>
                                            this.setState({
                                                groupBackModal: true,
                                            })
                                        }
                                    >
                                        <ListItemIcon
                                            className={classes.iconFix}
                                        >
                                            <AlarmOff />
                                        </ListItemIcon>
                                        <ListItemText primary="手動解約目前使用者組" />

                                        <ListItemSecondaryAction>
                                            <RightIcon
                                                className={classes.rightIcon}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                </div>
                            )}
                            <Divider />
                            <ListItem button onClick={() => this.bindQQ()}>
                                <ListItemIcon className={classes.iconFix}>
                                    <SettingsInputHdmi />
                                </ListItemIcon>
                                <ListItemText primary="QQ賬號" />

                                <ListItemSecondaryAction
                                    className={classes.flexContainer}
                                >
                                    <Typography
                                        className={classes.infoTextWithIcon}
                                        color="textSecondary"
                                    >
                                        {this.state.settings.qq
                                            ? "解除繫結"
                                            : "繫結"}
                                    </Typography>
                                    <RightIcon
                                        className={classes.rightIconWithText}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem
                                button
                                onClick={() =>
                                    this.setState({ changePolicy: true })
                                }
                            >
                                <ListItemIcon className={classes.iconFix}>
                                    <Backup />
                                </ListItemIcon>
                                <ListItemText primary="儲存策略" />

                                <ListItemSecondaryAction
                                    className={classes.flexContainer}
                                >
                                    <Typography
                                        className={classes.infoTextWithIcon}
                                        color="textSecondary"
                                    >
                                        {
                                            this.state.settings.policy.current
                                                .name
                                        }
                                    </Typography>
                                    <RightIcon
                                        className={classes.rightIconWithText}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem button>
                                <ListItemIcon className={classes.iconFix}>
                                    <ConfirmationNumber />
                                </ListItemIcon>
                                <ListItemText primary="積分" />

                                <ListItemSecondaryAction>
                                    <Typography
                                        className={classes.infoText}
                                        color="textSecondary"
                                    >
                                        {user.score}
                                    </Typography>
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem button>
                                <ListItemIcon className={classes.iconFix}>
                                    <DateIcon />
                                </ListItemIcon>
                                <ListItemText primary="註冊時間" />

                                <ListItemSecondaryAction>
                                    <Typography
                                        className={classes.infoText}
                                        color="textSecondary"
                                    >
                                        {transformTime(
                                            parseInt(user.created_at + "000")
                                        )}
                                    </Typography>
                                </ListItemSecondaryAction>
                            </ListItem>
                        </List>
                    </Paper>
                    <Typography
                        className={classes.sectionTitle}
                        variant="subtitle2"
                    >
                        安全隱私
                    </Typography>
                    <Paper>
                        <List className={classes.desenList}>
                            <ListItem button>
                                <ListItemIcon className={classes.iconFix}>
                                    <HomeIcon />
                                </ListItemIcon>
                                <ListItemText primary="個人主頁" />

                                <ListItemSecondaryAction>
                                    <Switch
                                        onChange={this.handleToggle}
                                        checked={this.state.settings.homepage}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem
                                button
                                onClick={() =>
                                    this.setState({ changePassword: true })
                                }
                            >
                                <ListItemIcon className={classes.iconFix}>
                                    <LockIcon />
                                </ListItemIcon>
                                <ListItemText primary="登錄密碼" />

                                <ListItemSecondaryAction
                                    className={classes.flexContainer}
                                >
                                    <RightIcon className={classes.rightIcon} />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem button onClick={() => this.init2FA()}>
                                <ListItemIcon className={classes.iconFix}>
                                    <VerifyIcon />
                                </ListItemIcon>
                                <ListItemText primary="二步驗證" />

                                <ListItemSecondaryAction
                                    className={classes.flexContainer}
                                >
                                    <Typography
                                        className={classes.infoTextWithIcon}
                                        color="textSecondary"
                                    >
                                        {!this.state.settings.two_factor
                                            ? "未開啟"
                                            : "已開啟"}
                                    </Typography>
                                    <RightIcon
                                        className={classes.rightIconWithText}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                        </List>
                    </Paper>

                    <Authn
                        list={this.state.settings.authn}
                        add={(credential) => {
                            this.setState({
                                settings: {
                                    ...this.state.settings,
                                    authn: [
                                        ...this.state.settings.authn,
                                        credential,
                                    ],
                                },
                            });
                        }}
                        remove={(id) => {
                            let credentials = [...this.state.settings.authn];
                            credentials = credentials.filter((v) => {
                                return v.id !== id;
                            });
                            this.setState({
                                settings: {
                                    ...this.state.settings,
                                    authn: credentials,
                                },
                            });
                        }}
                    />

                    <Typography
                        className={classes.sectionTitle}
                        variant="subtitle2"
                    >
                        個性化
                    </Typography>
                    <Paper>
                        <List className={classes.desenList}>
                            <ListItem
                                button
                                onClick={() =>
                                    this.setState({ changeTheme: true })
                                }
                            >
                                <ListItemIcon className={classes.iconFix}>
                                    <ColorIcon />
                                </ListItemIcon>
                                <ListItemText primary="主題配色" />

                                <ListItemSecondaryAction
                                    className={classes.flexContainer}
                                >
                                    <div className={classes.firstColor}></div>
                                    <div className={classes.secondColor}></div>
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem
                                button
                                onClick={() => this.toggleThemeMode(dark)}
                            >
                                <ListItemIcon className={classes.iconFix}>
                                    <Brightness3 />
                                </ListItemIcon>
                                <ListItemText primary="黑暗模式" />

                                <ListItemSecondaryAction
                                    className={classes.flexContainer}
                                >
                                    <Typography
                                        className={classes.infoTextWithIcon}
                                        color="textSecondary"
                                    >
                                        {dark &&
                                            (dark === "dark"
                                                ? "偏好開啟"
                                                : "偏好關閉")}
                                        {dark === null && "跟隨系統"}
                                    </Typography>
                                    <RightIcon
                                        className={classes.rightIconWithText}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                            <Divider />
                            <ListItem
                                button
                                onClick={() => this.toggleViewMethod()}
                            >
                                <ListItemIcon className={classes.iconFix}>
                                    <ListAlt />
                                </ListItemIcon>
                                <ListItemText primary="檔案列表" />

                                <ListItemSecondaryAction
                                    className={classes.flexContainer}
                                >
                                    <Typography
                                        className={classes.infoTextWithIcon}
                                        color="textSecondary"
                                    >
                                        {this.props.viewMethod === "icon" &&
                                            "大圖示"}
                                        {this.props.viewMethod === "list" &&
                                            "列表"}
                                        {this.props.viewMethod ===
                                            "smallIcon" && "小圖示"}
                                    </Typography>
                                    <RightIcon
                                        className={classes.rightIconWithText}
                                    />
                                </ListItemSecondaryAction>
                            </ListItem>
                        </List>
                    </Paper>
                    {user.group.webdav && (
                        <div>
                            <Typography
                                className={classes.sectionTitle}
                                variant="subtitle2"
                            >
                                WebDAV
                            </Typography>
                            <Paper>
                                <List className={classes.desenList}>
                                    <ListItem
                                        button
                                        onClick={() =>
                                            this.setState({
                                                showWebDavUrl: true,
                                            })
                                        }
                                    >
                                        <ListItemIcon
                                            className={classes.iconFix}
                                        >
                                            <LinkIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="連線地址" />

                                        <ListItemSecondaryAction
                                            className={classes.flexContainer}
                                        >
                                            <RightIcon
                                                className={classes.rightIcon}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    <Divider />
                                    <ListItem
                                        button
                                        onClick={() =>
                                            this.setState({
                                                showWebDavUserName: true,
                                            })
                                        }
                                    >
                                        <ListItemIcon
                                            className={classes.iconFix}
                                        >
                                            <InputIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="使用者名稱" />

                                        <ListItemSecondaryAction
                                            className={classes.flexContainer}
                                        >
                                            <RightIcon
                                                className={classes.rightIcon}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                    <Divider />
                                    <ListItem
                                        button
                                        onClick={() =>
                                            this.props.history.push("/webdav?")
                                        }
                                    >
                                        <ListItemIcon
                                            className={classes.iconFix}
                                        >
                                            <SecurityIcon />
                                        </ListItemIcon>
                                        <ListItemText primary="賬號管理" />

                                        <ListItemSecondaryAction
                                            className={classes.flexContainer}
                                        >
                                            <RightIcon
                                                className={classes.rightIcon}
                                            />
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                </List>
                            </Paper>
                        </div>
                    )}
                    <div className={classes.paddingBottom}></div>
                </div>
                <Dialog
                    open={this.state.changePolicy}
                    onClose={this.handleClose}
                >
                    <DialogTitle>切換儲存策略</DialogTitle>
                    <List>
                        {this.state.settings.policy.options.map(
                            (value, index) => (
                                <ListItem
                                    button
                                    component="label"
                                    key={index}
                                    onClick={() => this.changePolicy(value.id)}
                                >
                                    <ListItemAvatar>
                                        {value.id ===
                                            this.state.settings.policy.current
                                                .id && (
                                            <Avatar
                                                className={
                                                    classes.policySelected
                                                }
                                            >
                                                <Check />
                                            </Avatar>
                                        )}
                                        {value.id !==
                                            this.state.settings.policy.current
                                                .id && (
                                            <Avatar
                                                className={
                                                    classes.uploadFromFile
                                                }
                                            >
                                                <Backup />
                                            </Avatar>
                                        )}
                                    </ListItemAvatar>
                                    <ListItemText primary={value.name} />
                                </ListItem>
                            )
                        )}
                    </List>
                </Dialog>
                <Dialog
                    open={this.state.avatarModal}
                    onClose={this.handleClose}
                >
                    <DialogTitle>修改頭像</DialogTitle>
                    <List>
                        <ListItem
                            button
                            component="label"
                            disabled={this.state.loading === "avatar"}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                ref={this.fileInput}
                                onChange={this.uploadAvatar}
                            />
                            <ListItemAvatar>
                                <Avatar className={classes.uploadFromFile}>
                                    <PhotoIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText primary="從檔案上傳" />
                        </ListItem>
                        <ListItem
                            button
                            onClick={this.useGravatar}
                            disabled={this.state.loading === "gravatar"}
                        >
                            <ListItemAvatar>
                                <Avatar className={classes.userGravatar}>
                                    <FingerprintIcon />
                                </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                                className={classes.paddingText}
                                primary="使用 Gravatar 頭像 "
                            />
                        </ListItem>
                    </List>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            取消
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={this.state.nickModal} onClose={this.handleClose}>
                    <DialogTitle>修改昵稱</DialogTitle>
                    <DialogContent>
                        <TextField
                            id="standard-name"
                            label="昵稱"
                            className={classes.textField}
                            value={this.state.nick}
                            onChange={this.handleChange("nick")}
                            margin="normal"
                            autoFocus
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="default">
                            取消
                        </Button>
                        <Button
                            onClick={this.changeNick}
                            color="primary"
                            disabled={
                                this.state.loading === "nick" ||
                                this.state.nick === ""
                            }
                        >
                            儲存
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.state.groupBackModal}
                    onClose={this.handleClose}
                >
                    <DialogTitle>解約使用者組</DialogTitle>
                    <DialogContent>
                        將要退回到初始使用者組，且所支付金額無法退還，確定要繼續嗎？
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="default">
                            取消
                        </Button>
                        <Button onClick={this.doChangeGroup} color="primary">
                            確定
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.state.changePassword}
                    onClose={this.handleClose}
                >
                    <DialogTitle>修改登錄密碼</DialogTitle>
                    <DialogContent>
                        <div>
                            <TextField
                                id="standard-name"
                                label="原密碼"
                                type="password"
                                className={classes.textField}
                                value={this.state.oldPwd}
                                onChange={this.handleChange("oldPwd")}
                                margin="normal"
                                autoFocus
                            />
                        </div>
                        <div>
                            <TextField
                                id="standard-name"
                                label="新密碼"
                                type="password"
                                className={classes.textField}
                                value={this.state.newPwd}
                                onChange={this.handleChange("newPwd")}
                                margin="normal"
                            />
                        </div>
                        <div>
                            <TextField
                                id="standard-name"
                                label="確認新密碼"
                                type="password"
                                className={classes.textField}
                                value={this.state.newPwdRepeat}
                                onChange={this.handleChange("newPwdRepeat")}
                                margin="normal"
                            />
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="default">
                            取消
                        </Button>
                        <Button
                            onClick={this.changhePwd}
                            color="primary"
                            disabled={
                                this.state.loading === "changePassword" ||
                                this.state.oldPwd === "" ||
                                this.state.newPwdRepeat === "" ||
                                this.state.newPwd === ""
                            }
                        >
                            儲存
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={this.state.twoFactor} onClose={this.handleClose}>
                    <DialogTitle>
                        {this.state.settings.two_factor ? "關閉" : "啟用"}
                        二步驗證
                    </DialogTitle>
                    <DialogContent>
                        <div className={classes.flexContainerResponse}>
                            {!this.state.settings.two_factor && (
                                <div className={classes.qrcode}>
                                    <QRCode
                                        value={
                                            "otpauth://totp/" +
                                            this.props.title +
                                            "?secret=" +
                                            this.state.two_fa_secret
                                        }
                                    />
                                </div>
                            )}

                            <div className={classes.desText}>
                                {!this.state.settings.two_factor && (
                                    <Typography>
                                        請使用任意二步驗證APP或者支援二步驗證的密碼管理軟體掃瞄左側二維碼新增本站。掃瞄完成後請填寫二步驗證APP給出的6位驗證碼以開啟二步驗證。
                                    </Typography>
                                )}
                                {this.state.settings.two_factor && (
                                    <Typography>
                                        請驗證目前二步驗證程式碼。
                                    </Typography>
                                )}
                                <TextField
                                    id="standard-name"
                                    label="6位驗證碼"
                                    type="number"
                                    className={classes.textField}
                                    value={this.state.authCode}
                                    onChange={this.handleChange("authCode")}
                                    margin="normal"
                                    autoFocus
                                    fullWidth
                                />
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="default">
                            取消
                        </Button>
                        <Button
                            onClick={this.twoFactor}
                            color="primary"
                            disabled={
                                this.state.loading === "twoFactor" ||
                                this.state.authCode === ""
                            }
                        >
                            {this.state.settings.two_factor ? "關閉" : "啟用"}
                            二步驗證
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.state.changeTheme}
                    onClose={this.handleClose}
                >
                    <DialogTitle>更改主題配色</DialogTitle>
                    <DialogContent>
                        <ToggleButtonGroup
                            value={this.state.chosenTheme}
                            exclusive
                            onChange={this.handleAlignment}
                        >
                            {Object.keys(this.state.settings.themes).map(
                                (value, key) => (
                                    <ToggleButton value={value} key={key}>
                                        <div
                                            className={classes.themeBlock}
                                            style={{ backgroundColor: value }}
                                        />
                                    </ToggleButton>
                                )
                            )}
                        </ToggleButtonGroup>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="default">
                            取消
                        </Button>
                        <Button
                            onClick={this.changeTheme}
                            color="primary"
                            disabled={
                                this.state.loading === "changeTheme" ||
                                this.state.chosenTheme === null
                            }
                        >
                            儲存
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.state.showWebDavUrl}
                    onClose={this.handleClose}
                >
                    <DialogTitle>WebDAV連線地址</DialogTitle>
                    <DialogContent>
                        <TextField
                            id="standard-name"
                            className={classes.textField}
                            value={window.location.origin + "/dav"}
                            margin="normal"
                            autoFocus
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="default">
                            關閉
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.state.showWebDavUserName}
                    onClose={this.handleClose}
                >
                    <DialogTitle>WebDAV使用者名稱</DialogTitle>
                    <DialogContent>
                        <TextField
                            id="standard-name"
                            className={classes.textField}
                            value={user.user_name}
                            margin="normal"
                            autoFocus
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="default">
                            關閉
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

const UserSetting = connect(
    mapStateToProps,
    mapDispatchToProps
)(withStyles(styles)(withRouter(UserSettingCompoment)));

export default UserSetting;
