import React, { useCallback, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Input from "@material-ui/core/Input";
import FormHelperText from "@material-ui/core/FormHelperText";
import Button from "@material-ui/core/Button";
import API from "../../../middleware/Api";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../actions";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Switch from "@material-ui/core/Switch";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import AlertDialog from "../Dialogs/Alert";
import Alert from "@material-ui/lab/Alert";
import FileSelector from "../Common/FileSelector";

const useStyles = makeStyles((theme) => ({
    root: {
        [theme.breakpoints.up("md")]: {
            marginLeft: 100,
        },
        marginBottom: 40,
    },
    form: {
        maxWidth: 400,
        marginTop: 20,
        marginBottom: 20,
    },
    formContainer: {
        [theme.breakpoints.up("md")]: {
            padding: "0px 24px 0 24px",
        },
    },
}));

export default function Access() {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [initCompleted, setInitComplete] = useState(false);
    const [options, setOptions] = useState({
        register_enabled: "1",
        default_group: "1",
        email_active: "0",
        login_captcha: "0",
        reg_captcha: "0",
        forget_captcha: "0",
        qq_login: "0",
        qq_direct_login: "0",
        qq_login_id: "",
        qq_login_key: "",
        authn_enabled: "0",
        mail_domain_filter: "0",
        mail_domain_filter_list: "",
        initial_files: "[]",
    });
    const [siteURL, setSiteURL] = useState("");
    const [groups, setGroups] = useState([]);
    const [httpAlert, setHttpAlert] = useState(false);

    const handleChange = (name) => (event) => {
        let value = event.target.value;
        if (event.target.checked !== undefined) {
            value = event.target.checked ? "1" : "0";
        }
        setOptions({
            ...options,
            [name]: value,
        });
    };

    const handleInputChange = (name) => (event) => {
        const value = event.target.value;
        setOptions({
            ...options,
            [name]: value,
        });
    };

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    useEffect(() => {
        API.post("/admin/setting", {
            keys: [...Object.keys(options), "siteURL"],
        })
            .then((response) => {
                setSiteURL(response.data.siteURL);
                delete response.data.siteURL;
                setOptions(response.data);
                setInitComplete(true);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });

        API.get("/admin/groups")
            .then((response) => {
                setGroups(response.data);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
        // eslint-disable-next-line
    }, []);

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);
        const option = [];
        Object.keys(options).forEach((k) => {
            option.push({
                key: k,
                value: options[k],
            });
        });
        API.patch("/admin/setting", {
            options: option,
        })
            .then(() => {
                ToggleSnackbar("top", "right", "設定已更改", "success");
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });
    };

    return (
        <div>
            <AlertDialog
                title={"提示"}
                msg={
                    "Web Authn 需要您的站點啟用 HTTPS，並確認 參數設定 - 站點資訊 - 站點URL 也使用了 HTTPS 后才能開啟。"
                }
                onClose={() => setHttpAlert(false)}
                open={httpAlert}
            />
            <form onSubmit={submit}>
                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        註冊與登錄
                    </Typography>
                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                options.register_enabled === "1"
                                            }
                                            onChange={handleChange(
                                                "register_enabled"
                                            )}
                                        />
                                    }
                                    label="允許新使用者註冊"
                                />
                                <FormHelperText id="component-helper-text">
                                    關閉后，無法再通過前臺註冊新的使用者
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                options.email_active === "1"
                                            }
                                            onChange={handleChange(
                                                "email_active"
                                            )}
                                        />
                                    }
                                    label="郵件啟用"
                                />
                                <FormHelperText id="component-helper-text">
                                    開啟后，新使用者註冊需要點選郵件中的啟用鏈接才能完成。請確認郵件發送設定是否正確，否則啟用郵件無法送達
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                options.reg_captcha === "1"
                                            }
                                            onChange={handleChange(
                                                "reg_captcha"
                                            )}
                                        />
                                    }
                                    label="註冊驗證碼"
                                />
                                <FormHelperText id="component-helper-text">
                                    是否啟用註冊表單驗證碼
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                options.login_captcha === "1"
                                            }
                                            onChange={handleChange(
                                                "login_captcha"
                                            )}
                                        />
                                    }
                                    label="登錄驗證碼"
                                />
                                <FormHelperText id="component-helper-text">
                                    是否啟用登錄表單驗證碼
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                options.forget_captcha === "1"
                                            }
                                            onChange={handleChange(
                                                "forget_captcha"
                                            )}
                                        />
                                    }
                                    label="找回密碼驗證碼"
                                />
                                <FormHelperText id="component-helper-text">
                                    是否啟用找回密碼錶單驗證碼
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                options.authn_enabled === "1"
                                            }
                                            onChange={(e) => {
                                                if (
                                                    !siteURL.startsWith(
                                                        "https://"
                                                    )
                                                ) {
                                                    setHttpAlert(true);
                                                    return;
                                                }
                                                handleChange("authn_enabled")(
                                                    e
                                                );
                                            }}
                                        />
                                    }
                                    label="Web Authn"
                                />
                                <FormHelperText id="component-helper-text">
                                    是否允許使用者使用繫結的外部驗證器登錄，站點必須啟動
                                    HTTPS 才能使用。
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    預設使用者組
                                </InputLabel>
                                <Select
                                    value={options.default_group}
                                    onChange={handleInputChange(
                                        "default_group"
                                    )}
                                    required
                                >
                                    {groups.map((v) => {
                                        if (v.ID === 3) {
                                            return null;
                                        }
                                        return (
                                            <MenuItem
                                                key={v.ID}
                                                value={v.ID.toString()}
                                            >
                                                {v.Name}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                                <FormHelperText id="component-helper-text">
                                    使用者註冊后的初始使用者組
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl>
                                {initCompleted && (
                                    <FileSelector
                                        label={"初始檔案"}
                                        value={JSON.parse(
                                            options.initial_files
                                        )}
                                        onChange={(v) =>
                                            handleInputChange("initial_files")({
                                                target: { value: v },
                                            })
                                        }
                                    />
                                )}
                                <FormHelperText id="component-helper-text">
                                    指定使用者註冊后初始擁有的檔案。輸入檔案 ID
                                    搜索並新增現有檔案。
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    過濾註冊郵箱域
                                </InputLabel>
                                <Select
                                    value={options.mail_domain_filter}
                                    onChange={handleInputChange(
                                        "mail_domain_filter"
                                    )}
                                    required
                                >
                                    {["不啟用", "白名單", "黑名單"].map(
                                        (v, i) => (
                                            <MenuItem
                                                key={i}
                                                value={i.toString()}
                                            >
                                                {v}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                                <FormHelperText id="component-helper-text">
                                    是否限制可用於註冊的電子郵箱域
                                </FormHelperText>
                            </FormControl>
                        </div>

                        {options.mail_domain_filter !== "0" && (
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-helper">
                                        郵箱域過濾規則
                                    </InputLabel>
                                    <Input
                                        value={options.mail_domain_filter_list}
                                        onChange={handleChange(
                                            "mail_domain_filter_list"
                                        )}
                                        multiline
                                        rowsMax="10"
                                    />
                                    <FormHelperText id="component-helper-text">
                                        多個域請使用半形逗號隔開
                                    </FormHelperText>
                                </FormControl>
                            </div>
                        )}
                    </div>
                </div>

                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        QQ互聯
                    </Typography>
                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <Alert severity="info">
                                建立應用時，回撥地址請填寫：
                                {siteURL.endsWith("/")
                                    ? siteURL + "login/qq"
                                    : siteURL + "/login/qq"}
                            </Alert>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={options.qq_login === "1"}
                                            onChange={handleChange("qq_login")}
                                        />
                                    }
                                    label="開啟QQ互聯"
                                />
                                <FormHelperText id="component-helper-text">
                                    是否允許繫結QQ、使用QQ登錄本站
                                </FormHelperText>
                            </FormControl>
                        </div>

                        {options.qq_login === "1" && (
                            <>
                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={
                                                        options.qq_direct_login ===
                                                        "1"
                                                    }
                                                    onChange={handleChange(
                                                        "qq_direct_login"
                                                    )}
                                                />
                                            }
                                            label="未繫結時可直接登錄"
                                        />
                                        <FormHelperText id="component-helper-text">
                                            開啟后，如果使用者使用了QQ登錄，但是沒有已繫結的註冊使用者，系統會為其建立使用者並登錄。這種方式建立的使用者日後只能使用QQ登錄。
                                        </FormHelperText>
                                    </FormControl>
                                </div>

                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            APP ID
                                        </InputLabel>
                                        <Input
                                            required
                                            value={options.qq_login_id}
                                            onChange={handleInputChange(
                                                "qq_login_id"
                                            )}
                                        />
                                        <FormHelperText id="component-helper-text">
                                            應用管理頁面獲取到的的 APP ID
                                        </FormHelperText>
                                    </FormControl>
                                </div>

                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            APP KEY
                                        </InputLabel>
                                        <Input
                                            required
                                            value={options.qq_login_key}
                                            onChange={handleInputChange(
                                                "qq_login_key"
                                            )}
                                        />
                                        <FormHelperText id="component-helper-text">
                                            應用管理頁面獲取到的的 APP KEY
                                        </FormHelperText>
                                    </FormControl>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className={classes.root}>
                    <Button
                        disabled={loading}
                        type={"submit"}
                        variant={"contained"}
                        color={"primary"}
                    >
                        儲存
                    </Button>
                </div>
            </form>
        </div>
    );
}
