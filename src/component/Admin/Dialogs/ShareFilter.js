import React, { useState } from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import TextField from "@material-ui/core/TextField";

export default function ShareFilter({ setFilter, setSearch, open, onClose }) {
    const [input, setInput] = useState({
        is_dir: "all",
        user_id: "",
    });
    const [keywords, setKeywords] = useState("");

    const handleChange = (name) => (event) => {
        setInput({ ...input, [name]: event.target.value });
    };

    const submit = () => {
        const res = {};
        Object.keys(input).forEach((v) => {
            if (input[v] !== "all" && input[v] !== "") {
                res[v] = input[v];
            }
        });
        setFilter(res);
        if (keywords !== "") {
            setSearch({
                source_name: keywords,
            });
        } else {
            setSearch({});
        }
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            fullWidth
            maxWidth={"xs"}
        >
            <DialogTitle id="alert-dialog-title">過濾條件</DialogTitle>
            <DialogContent>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">
                        原始檔型別
                    </InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={input.is_dir}
                        onChange={handleChange("is_dir")}
                    >
                        <MenuItem value={"all"}>全部</MenuItem>
                        <MenuItem value={"1"}>目錄</MenuItem>
                        <MenuItem value={"0"}>檔案</MenuItem>
                    </Select>
                </FormControl>
                <FormControl fullWidth style={{ marginTop: 16 }}>
                    <TextField
                        value={input.user_id}
                        onChange={handleChange("user_id")}
                        id="standard-basic"
                        label="上傳者ID"
                    />
                </FormControl>
                <FormControl fullWidth style={{ marginTop: 16 }}>
                    <TextField
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        id="standard-basic"
                        label="搜索 檔名"
                    />
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="default">
                    取消
                </Button>
                <Button onClick={submit} color="primary">
                    應用
                </Button>
            </DialogActions>
        </Dialog>
    );
}
