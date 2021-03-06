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
import Alert from "@material-ui/lab/Alert";
import Link from "@material-ui/core/Link";

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

export default function Aria2() {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState({
        aria2_rpcurl: "",
        aria2_token: "",
        aria2_temp_path: "",
        aria2_options: "",
        aria2_interval: "0",
        aria2_call_timeout: "0",
    });

    const handleChange = (name) => (event) => {
        setOptions({
            ...options,
            [name]: event.target.value,
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
            keys: Object.keys(options),
        })
            .then((response) => {
                setOptions(response.data);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
        // eslint-disable-next-line
    }, []);

    const reload = () => {
        API.get("/admin/reload/aria2")
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            .then(() => {})
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            .then(() => {});
    };

    const test = () => {
        setLoading(true);
        API.post("/admin/aria2/test", {
            server: options.aria2_rpcurl,
            token: options.aria2_token,
        })
            .then((response) => {
                ToggleSnackbar(
                    "top",
                    "right",
                    "???????????????Aria2 ????????????" + response.data,
                    "success"
                );
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });
    };

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
                ToggleSnackbar("top", "right", "???????????????", "success");
                reload();
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
            <form onSubmit={submit}>
                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        Aria2
                    </Typography>

                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <Alert severity="info" style={{ marginTop: 8 }}>
                                <Typography variant="body2">
                                    Cloudreve ????????????????????????{" "}
                                    <Link
                                        href={"https://aria2.github.io/"}
                                        target={"_blank"}
                                    >
                                        Aria2
                                    </Link>{" "}
                                    ?????????????????????????????????????????????????????????
                                    Cloudreve ?????????????????????????????? Aria2??? ??????
                                    Aria2 ???????????????????????? RPC
                                    ????????????????????????????????????????????????{" "}
                                    <Link
                                        href={
                                            "https://docs.cloudreve.org/use/aria2"
                                        }
                                        target={"_blank"}
                                    >
                                        ????????????
                                    </Link>{" "}
                                    ?????????
                                </Typography>
                            </Alert>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    RPC ???????????????
                                </InputLabel>
                                <Input
                                    type={"url"}
                                    value={options.aria2_rpcurl}
                                    onChange={handleChange("aria2_rpcurl")}
                                />
                                <FormHelperText id="component-helper-text">
                                    ?????????????????? RPC
                                    ???????????????????????????http://127.0.0.1:6800/????????????????????????
                                    Aria2 ??????
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    RPC Secret
                                </InputLabel>
                                <Input
                                    value={options.aria2_token}
                                    onChange={handleChange("aria2_token")}
                                />
                                <FormHelperText id="component-helper-text">
                                    RPC ?????????????????? Aria2
                                    ???????????????????????????????????????????????????
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    ??????????????????
                                </InputLabel>
                                <Input
                                    value={options.aria2_temp_path}
                                    onChange={handleChange("aria2_temp_path")}
                                />
                                <FormHelperText id="component-helper-text">
                                    ?????????????????????????????????
                                    <strong>????????????</strong>???Cloudreve
                                    ??????????????????????????????????????????????????????
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    ???????????????????????? (???)
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        step: 1,
                                        min: 1,
                                    }}
                                    required
                                    value={options.aria2_interval}
                                    onChange={handleChange("aria2_interval")}
                                />
                                <FormHelperText id="component-helper-text">
                                    Cloudreve ??? Aria2 ??????????????????????????????????????????
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    RPC ???????????? (???)
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        step: 1,
                                        min: 1,
                                    }}
                                    required
                                    value={options.aria2_call_timeout}
                                    onChange={handleChange(
                                        "aria2_call_timeout"
                                    )}
                                />
                                <FormHelperText id="component-helper-text">
                                    ?????? RPC ???????????????????????????
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    ?????????????????????
                                </InputLabel>
                                <Input
                                    multiline
                                    required
                                    value={options.aria2_options}
                                    onChange={handleChange("aria2_options")}
                                />
                                <FormHelperText id="component-helper-text">
                                    ?????????????????????????????????????????????????????? JSON
                                    ???????????????????????????????????????????????????????????????
                                    Aria2 ???????????????????????????????????????????????????
                                </FormHelperText>
                            </FormControl>
                        </div>
                    </div>
                </div>

                <div className={classes.root}>
                    <Button
                        disabled={loading}
                        type={"submit"}
                        variant={"contained"}
                        color={"primary"}
                    >
                        ??????
                    </Button>
                    <Button
                        style={{ marginLeft: 8 }}
                        disabled={loading}
                        onClick={() => test()}
                        variant={"outlined"}
                        color={"secondary"}
                    >
                        ????????????
                    </Button>
                </div>
            </form>
        </div>
    );
}
