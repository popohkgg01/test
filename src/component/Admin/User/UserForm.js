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
import { useHistory } from "react-router";

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
export default function UserForm(props) {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(
        props.user
            ? props.user
            : {
                  ID: 0,
                  Email: "",
                  Nick: "",
                  Password: "", // 為空時只讀
                  Status: "0", // 轉換型別
                  GroupID: "2", // 轉換型別
                  Score: "0", // 轉換型別
              }
    );
    const [groups, setGroups] = useState([]);

    const history = useHistory();

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    useEffect(() => {
        API.get("/admin/groups")
            .then((response) => {
                setGroups(response.data);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    }, []);

    const handleChange = (name) => (event) => {
        setUser({
            ...user,
            [name]: event.target.value,
        });
    };

    const submit = (e) => {
        e.preventDefault();
        const userCopy = { ...user };

        // 整型轉換
        ["Status", "GroupID", "Score"].forEach((v) => {
            userCopy[v] = parseInt(userCopy[v]);
        });

        setLoading(true);
        API.post("/admin/user", {
            user: userCopy,
            password: userCopy.Password,
        })
            .then(() => {
                history.push("/admin/user");
                ToggleSnackbar(
                    "top",
                    "right",
                    "使用者已" + (props.user ? "儲存" : "新增"),
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

    return (
        <div>
            <form onSubmit={submit}>
                <div className={classes.root}>
                    <Typography variant="h6" gutterBottom>
                        {user.ID === 0 && "建立使用者"}
                        {user.ID !== 0 && "編輯 " + user.Nick}
                    </Typography>

                    <div className={classes.formContainer}>
                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    郵箱
                                </InputLabel>
                                <Input
                                    value={user.Email}
                                    type={"email"}
                                    onChange={handleChange("Email")}
                                    required
                                />
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    昵稱
                                </InputLabel>
                                <Input
                                    value={user.Nick}
                                    onChange={handleChange("Nick")}
                                    required
                                />
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    密碼
                                </InputLabel>
                                <Input
                                    type={"password"}
                                    value={user.Password}
                                    onChange={handleChange("Password")}
                                    required={user.ID === 0}
                                />
                                <FormHelperText id="component-helper-text">
                                    {user.ID !== 0 && "留空表示不修改"}
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    使用者組
                                </InputLabel>
                                <Select
                                    value={user.GroupID}
                                    onChange={handleChange("GroupID")}
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
                                    使用者所屬使用者組
                                </FormHelperText>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    狀態
                                </InputLabel>
                                <Select
                                    value={user.Status}
                                    onChange={handleChange("Status")}
                                    required
                                >
                                    <MenuItem value={"0"}>正常</MenuItem>
                                    <MenuItem value={"1"}>未啟用</MenuItem>
                                    <MenuItem value={"2"}>被封禁</MenuItem>
                                    <MenuItem value={"3"}>
                                        超額使用被封禁
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </div>

                        <div className={classes.form}>
                            <FormControl fullWidth>
                                <InputLabel htmlFor="component-helper">
                                    積分
                                </InputLabel>
                                <Input
                                    type={"number"}
                                    inputProps={{
                                        min: 0,
                                        step: 1,
                                    }}
                                    value={user.Score}
                                    onChange={handleChange("Score")}
                                    required
                                />
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
                        儲存
                    </Button>
                </div>
            </form>
        </div>
    );
}
