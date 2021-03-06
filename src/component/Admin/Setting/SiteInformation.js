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

export default function SiteInformation() {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [options, setOptions] = useState({
        siteURL: "",
        siteName: "",
        siteTitle: "",
        siteDes: "",
        siteICPId: "",
        siteScript: "",
        siteNotice: "",
        pwa_small_icon: "",
        pwa_medium_icon: "",
        pwa_large_icon: "",
        pwa_display: "",
        pwa_theme_color: "",
        pwa_background_color: "",
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
                        ????????????
                    </Typography>
                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    ?????????
                                </InputLabel>
                                <Input
                                    value={options.siteName}
                                    onChange={handleChange("siteName")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    ??????????????????
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    ?????????
                                </InputLabel>
                                <Input
                                    value={options.siteTitle}
                                    onChange={handleChange("siteTitle")}
                                />
                                <FormHelperText id="component-helper-text">
                                    ??????????????????
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    ????????????
                                </InputLabel>
                                <Input
                                    value={options.siteDes}
                                    onChange={handleChange("siteDes")}
                                />
                                <FormHelperText id="component-helper-text">
                                    ????????????????????????????????????????????????????????????
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    ??????URL
                                </InputLabel>
                                <Input
                                    type={"url"}
                                    value={options.siteURL}
                                    onChange={handleChange("siteURL")}
                                    required
                                />
                                <FormHelperText id="component-helper-text">
                                    ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    ???????????????
                                </InputLabel>
                                <Input
                                    value={options.siteICPId}
                                    onChange={handleChange("siteICPId")}
                                />
                                <FormHelperText id="component-helper-text">
                                    ???????????????ICP?????????
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    ???????????????
                                </InputLabel>
                                <Input
                                    multiline
                                    value={options.siteScript}
                                    onChange={handleChange("siteScript")}
                                />
                                <FormHelperText id="component-helper-text">
                                    ?????????????????????????????????HTML?????????
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    ????????????
                                </InputLabel>
                                <Input
                                    placeholder={"?????? HTML ?????????"}
                                    multiline
                                    value={options.siteNotice}
                                    onChange={handleChange("siteNotice")}
                                />
                                <FormHelperText id="component-helper-text">
                                    ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
                                </FormHelperText>
                            </FormControl>
                        </div>
                    </div>
                </div>
                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        ??????????????? (PWA)
                    </Typography>
                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    ?????????
                                </InputLabel>
                                <Input
                                    value={options.pwa_small_icon}
                                    onChange={handleChange("pwa_small_icon")}
                                />
                                <FormHelperText id="component-helper-text">
                                    ???????????? ico ??????????????????
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    ?????????
                                </InputLabel>
                                <Input
                                    value={options.pwa_medium_icon}
                                    onChange={handleChange("pwa_medium_icon")}
                                />
                                <FormHelperText id="component-helper-text">
                                    192x192 ????????????????????????png ??????
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    ?????????
                                </InputLabel>
                                <Input
                                    value={options.pwa_large_icon}
                                    onChange={handleChange("pwa_large_icon")}
                                />
                                <FormHelperText id="component-helper-text">
                                    512x512 ?????????????????????png ??????
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl>
                                <InputLabel htmlFor="component-helper">
                                    ????????????
                                </InputLabel>
                                <Select
                                    value={options.pwa_display}
                                    onChange={handleChange("pwa_display")}
                                >
                                    <MenuItem value={"fullscreen"}>
                                        fullscreen
                                    </MenuItem>
                                    <MenuItem value={"standalone"}>
                                        standalone
                                    </MenuItem>
                                    <MenuItem value={"minimal-ui"}>
                                        minimal-ui
                                    </MenuItem>
                                    <MenuItem value={"browser"}>
                                        browser
                                    </MenuItem>
                                </Select>
                                <FormHelperText id="component-helper-text">
                                    PWA ??????????????????????????????
                                </FormHelperText>
                            </FormControl>
                        </div>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    ?????????
                                </InputLabel>
                                <Input
                                    value={options.pwa_theme_color}
                                    onChange={handleChange("pwa_theme_color")}
                                />
                                <FormHelperText id="component-helper-text">
                                    CSS ??????????????? PWA
                                    ?????????????????????????????????????????????????????????????????????
                                </FormHelperText>
                            </FormControl>
                        </div>
                    </div>
                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    ?????????
                                </InputLabel>
                                <Input
                                    value={options.pwa_background_color}
                                    onChange={handleChange(
                                        "pwa_background_color"
                                    )}
                                />
                                <FormHelperText id="component-helper-text">
                                    CSS ??????
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
                </div>
            </form>
        </div>
    );
}
