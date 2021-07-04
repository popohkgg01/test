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
import Tab from "@material-ui/core/Tab";
import Paper from "@material-ui/core/Paper";
import Tabs from "@material-ui/core/Tabs";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import Link from "@material-ui/core/Link";
import Alert from "@material-ui/lab/Alert";
import AddPack from "../Dialogs/AddPack";
import TableHead from "@material-ui/core/TableHead";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import IconButton from "@material-ui/core/IconButton";
import { Delete, Edit } from "@material-ui/icons";
import { sizeToString } from "../../../utils";
import AddGroup from "../Dialogs/AddGroupk";
import AddRedeem from "../Dialogs/AddRedeem";
import AlertDialog from "../Dialogs/Alert";
import Box from "@material-ui/core/Box";
import Pagination from "@material-ui/lab/Pagination";

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
    tabForm: {
        marginTop: 20,
    },
    content: {
        padding: theme.spacing(2),
    },
    tableContainer: {
        overflowX: "auto",
        marginTop: theme.spacing(2),
    },
    navigator: {
        marginTop: 10,
    },
}));

const product = {};

export default function VAS() {
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState(0);
    const [options, setOptions] = useState({
        alipay_enabled: "0",
        payjs_enabled: "0",
        payjs_id: "",
        appid: "",
        appkey: "",
        shopid: "",
        payjs_secret: "",
        score_enabled: "0",
        share_score_rate: "0",
        score_price: "0",
        ban_time: "0",
        group_sell_data: "[]",
        pack_data: "[]",
    });
    const [groups, setGroups] = useState([]);
    const [packs, setPacks] = useState([]);
    const [addPack, setAddPack] = useState(false);
    const [addGroup, setAddGroup] = useState(false);
    const [packEdit, setPackEdit] = useState(null);
    const [groupEdit, setGroupEdit] = useState(null);
    const [addRedeem, setAddRedeem] = useState(false);
    const [redeems, setRedeems] = useState([]);
    const [redeemsRes, setRedeemsRes] = useState([]);
    const [redeemsResOpen, setRedeemsResOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(20);
    const [total, setTotal] = useState(0);

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const loadRedeemList = () => {
        API.post("/admin/redeem/list", {
            page: page,
            page_size: pageSize,
            order_by: "id desc",
        })
            .then((response) => {
                setRedeems(response.data.items);
                setTotal(response.data.total);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    };

    useEffect(() => {
        const res = JSON.parse(options.group_sell_data);
        res.forEach((k) => {
            product[k.id] = k.name;
        });
        setGroups(res);
    }, [options.group_sell_data]);

    useEffect(() => {
        const res = JSON.parse(options.pack_data);
        res.forEach((k) => {
            product[k.id] = k.name;
        });
        setPacks(res);
    }, [options.pack_data]);

    useEffect(() => {
        if (tab === 3) {
            loadRedeemList();
        }
    }, [tab, page, pageSize]);

    const deleteRedeem = (id) => {
        API.delete("/admin/redeem/" + id)
            .then(() => {
                loadRedeemList();
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            });
    };

    const redeemGenerated = (codes) => {
        setRedeemsRes(codes);
        setRedeemsResOpen(true);
        loadRedeemList();
    };

    const handleChange = (name) => (event) => {
        setOptions({
            ...options,
            [name]: event.target.value,
        });
    };

    const handleCheckChange = (name) => (event) => {
        let value = event.target.value;
        if (event.target.checked !== undefined) {
            value = event.target.checked ? "1" : "0";
        }
        setOptions({
            ...options,
            [name]: value,
        });
    };

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

    const updateOption = () => {
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

    const submit = (e) => {
        e.preventDefault();
        setLoading(true);
        updateOption();
    };

    const updatePackOption = (name, pack) => {
        const option = [];
        Object.keys(options).forEach((k) => {
            option.push({
                key: k,
                value: k === name ? pack : options[k],
            });
        });
        API.patch("/admin/setting", {
            options: option,
        })
            .then(() => {
                ToggleSnackbar("top", "right", "設定已儲存", "success");
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });
    };

    const handleAddPack = (pack, isEdit) => {
        setAddPack(false);
        setPackEdit(null);
        let newPacks;
        if (isEdit) {
            newPacks = packs.map((v) => {
                if (v.id === pack.id) {
                    return pack;
                }
                return v;
            });
        } else {
            newPacks = [...packs, pack];
        }

        setPacks(newPacks);
        const newPackData = JSON.stringify(newPacks);
        setOptions({ ...options, pack_data: newPackData });
        updatePackOption("pack_data", newPackData);
    };

    const handleAddGroup = (group, isEdit) => {
        setAddGroup(false);
        setGroupEdit(null);
        let newGroup;
        if (isEdit) {
            newGroup = groups.map((v) => {
                if (v.id === group.id) {
                    return group;
                }
                return v;
            });
        } else {
            newGroup = [...groups, group];
        }

        setGroups(newGroup);
        const newGroupData = JSON.stringify(newGroup);
        setOptions({ ...options, group_sell_data: newGroupData });
        updatePackOption("group_sell_data", newGroupData);
    };

    const deletePack = (id) => {
        let newPacks = [...packs];
        newPacks = newPacks.filter((v) => {
            return v.id !== id;
        });
        setPacks(newPacks);
        const newPackData = JSON.stringify(newPacks);
        setOptions({ ...options, pack_data: newPackData });
        updatePackOption("pack_data", newPackData);
    };

    const deleteGroup = (id) => {
        let newGroups = [...groups];
        newGroups = newGroups.filter((v) => {
            return v.id !== id;
        });
        setGroups(newGroups);
        const newPackData = JSON.stringify(newGroups);
        setOptions({ ...options, group_sell_data: newPackData });
        updatePackOption("group_sell_data", newPackData);
    };

    return (
        <div>
            <Paper square>
                <Tabs
                    value={tab}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={(e, v) => setTab(v)}
                    scrollButtons="auto"
                >
                    <Tab label="支付/雜項設定" />
                    <Tab label="容量包" />
                    <Tab label="可購使用者組" />
                    <Tab label="兌換碼" />
                </Tabs>
                <div className={classes.content}>
                    {tab === 0 && (
                        <form onSubmit={submit} className={classes.tabForm}>
                            <div className={classes.root}>
                                <Typography variant="h6" gutterBottom>
                                    支付寶當面付
                                </Typography>
                                <div className={classes.formContainer}>
                                    <div className={classes.form}>
                                        <FormControl fullWidth>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={
                                                            options.alipay_enabled ===
                                                            "1"
                                                        }
                                                        onChange={handleCheckChange(
                                                            "alipay_enabled"
                                                        )}
                                                    />
                                                }
                                                label="開啟"
                                            />
                                        </FormControl>
                                    </div>

                                    {options.alipay_enabled === "1" && (
                                        <>
                                            <div className={classes.form}>
                                                <FormControl fullWidth>
                                                    <InputLabel htmlFor="component-helper">
                                                        App- ID
                                                    </InputLabel>
                                                    <Input
                                                        value={options.appid}
                                                        onChange={handleChange(
                                                            "appid"
                                                        )}
                                                        required
                                                    />
                                                    <FormHelperText id="component-helper-text">
                                                        當面付應用的 APPID
                                                    </FormHelperText>
                                                </FormControl>
                                            </div>

                                            <div className={classes.form}>
                                                <FormControl fullWidth>
                                                    <InputLabel htmlFor="component-helper">
                                                        RSA 應用私鑰
                                                    </InputLabel>
                                                    <Input
                                                        value={options.appkey}
                                                        onChange={handleChange(
                                                            "appkey"
                                                        )}
                                                        multiline
                                                        rowsMax={10}
                                                        required
                                                    />
                                                    <FormHelperText id="component-helper-text">
                                                        當面付應用的 RSA2
                                                        (SHA256)
                                                        私鑰，一般是由您自己產生。
                                                        詳情參考
                                                        <Link
                                                            target={"_blank"}
                                                            href={
                                                                "https://docs.open.alipay.com/291/105971"
                                                            }
                                                        >
                                                            產生 RSA 金鑰
                                                        </Link>
                                                    </FormHelperText>
                                                </FormControl>
                                            </div>

                                            <div className={classes.form}>
                                                <FormControl fullWidth>
                                                    <InputLabel htmlFor="component-helper">
                                                        支付寶公鑰
                                                    </InputLabel>
                                                    <Input
                                                        value={options.shopid}
                                                        onChange={handleChange(
                                                            "shopid"
                                                        )}
                                                        multiline
                                                        rowsMax={10}
                                                        required
                                                    />
                                                    <FormHelperText id="component-helper-text">
                                                        由支付寶提供，可在
                                                        應用管理 - 應用資訊 -
                                                        介面加簽方式 中獲取
                                                    </FormHelperText>
                                                </FormControl>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className={classes.root}>
                                <Typography variant="h6" gutterBottom>
                                    PAYJS 微信支付
                                </Typography>

                                <div className={classes.formContainer}>
                                    <div className={classes.form}>
                                        <Alert severity="info">
                                            <Typography variant="body2">
                                                此服務由第三方平臺{" "}
                                                <Link
                                                    href={"https://payjs.cn/"}
                                                    target={"_blank"}
                                                >
                                                    PAYJS
                                                </Link>{" "}
                                                提供， 產生的任何糾紛與
                                                Cloudreve 開發者無關。
                                            </Typography>
                                        </Alert>
                                    </div>
                                    <div className={classes.form}>
                                        <FormControl fullWidth>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={
                                                            options.payjs_enabled ===
                                                            "1"
                                                        }
                                                        onChange={handleCheckChange(
                                                            "payjs_enabled"
                                                        )}
                                                    />
                                                }
                                                label="開啟"
                                            />
                                        </FormControl>
                                    </div>

                                    {options.payjs_enabled === "1" && (
                                        <>
                                            <div className={classes.form}>
                                                <FormControl fullWidth>
                                                    <InputLabel htmlFor="component-helper">
                                                        商戶號
                                                    </InputLabel>
                                                    <Input
                                                        value={options.payjs_id}
                                                        onChange={handleChange(
                                                            "payjs_id"
                                                        )}
                                                        required
                                                    />
                                                    <FormHelperText id="component-helper-text">
                                                        可在 PAYJS
                                                        管理面板首頁看到
                                                    </FormHelperText>
                                                </FormControl>
                                            </div>

                                            <div className={classes.form}>
                                                <FormControl fullWidth>
                                                    <InputLabel htmlFor="component-helper">
                                                        通訊金鑰
                                                    </InputLabel>
                                                    <Input
                                                        value={
                                                            options.payjs_secret
                                                        }
                                                        onChange={handleChange(
                                                            "payjs_secret"
                                                        )}
                                                        required
                                                    />
                                                    <FormHelperText id="component-helper-text">
                                                        可在 PAYJS
                                                        管理面板首頁看到
                                                    </FormHelperText>
                                                </FormControl>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className={classes.root}>
                                <Typography variant="h6" gutterBottom>
                                    雜項設定
                                </Typography>
                                <div className={classes.formContainer}>
                                    <div className={classes.form}>
                                        <FormControl fullWidth>
                                            <InputLabel htmlFor="component-helper">
                                                封禁緩衝期 (秒)
                                            </InputLabel>
                                            <Input
                                                type={"number"}
                                                inputProps={{
                                                    step: 1,
                                                    min: 1,
                                                }}
                                                value={options.ban_time}
                                                onChange={handleChange(
                                                    "ban_time"
                                                )}
                                                required
                                            />
                                            <FormHelperText id="component-helper-text">
                                                使用者保持容量超額狀態的最長時長，超出時長該使用者會被系統凍結
                                            </FormHelperText>
                                        </FormControl>
                                    </div>

                                    <div className={classes.form}>
                                        <FormControl fullWidth>
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={
                                                            options.score_enabled ===
                                                            "1"
                                                        }
                                                        onChange={handleCheckChange(
                                                            "score_enabled"
                                                        )}
                                                    />
                                                }
                                                label="允許為分享定價"
                                            />
                                            <FormHelperText>
                                                開啟后，使用者可為分享設定積分價格，下載需要扣除積分
                                            </FormHelperText>
                                        </FormControl>
                                    </div>

                                    {options.score_enabled === "1" && (
                                        <div className={classes.form}>
                                            <FormControl fullWidth>
                                                <InputLabel htmlFor="component-helper">
                                                    積分到賬比率 (%)
                                                </InputLabel>
                                                <Input
                                                    type={"number"}
                                                    inputProps={{
                                                        step: 1,
                                                        min: 0,
                                                        max: 100,
                                                    }}
                                                    value={
                                                        options.share_score_rate
                                                    }
                                                    onChange={handleChange(
                                                        "share_score_rate"
                                                    )}
                                                    required
                                                />
                                                <FormHelperText id="component-helper-text">
                                                    購買下載設定價格的分享，分享者實際到賬的積分比率
                                                </FormHelperText>
                                            </FormControl>
                                        </div>
                                    )}

                                    <div className={classes.form}>
                                        <FormControl fullWidth>
                                            <InputLabel htmlFor="component-helper">
                                                積分價格 (分)
                                            </InputLabel>
                                            <Input
                                                type={"number"}
                                                inputProps={{
                                                    step: 1,
                                                    min: 1,
                                                }}
                                                value={options.score_price}
                                                onChange={handleChange(
                                                    "score_price"
                                                )}
                                                required
                                            />
                                            <FormHelperText id="component-helper-text">
                                                充值積分時的價格
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
                                    儲存
                                </Button>
                            </div>
                        </form>
                    )}

                    {tab === 1 && (
                        <div>
                            <Button
                                onClick={() => setAddPack(true)}
                                variant={"contained"}
                                color={"secondary"}
                            >
                                新增
                            </Button>
                            <div className={classes.tableContainer}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>名稱</TableCell>
                                            <TableCell>單價</TableCell>
                                            <TableCell>時長</TableCell>
                                            <TableCell>大小</TableCell>
                                            <TableCell>操作</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {packs.map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell
                                                    component="th"
                                                    scope="row"
                                                >
                                                    {row.name}
                                                </TableCell>
                                                <TableCell>
                                                    ￥{row.price / 100}
                                                    {row.score !== 0 &&
                                                        " 或 " +
                                                            row.score +
                                                            " 積分"}
                                                </TableCell>
                                                <TableCell>
                                                    {Math.ceil(
                                                        row.time / 86400
                                                    )}
                                                    天
                                                </TableCell>
                                                <TableCell>
                                                    {sizeToString(row.size)}
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        onClick={() => {
                                                            setPackEdit(row);
                                                            setAddPack(true);
                                                        }}
                                                        size={"small"}
                                                    >
                                                        <Edit />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() =>
                                                            deletePack(row.id)
                                                        }
                                                        size={"small"}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {tab === 2 && (
                        <div>
                            <Button
                                onClick={() => setAddGroup(true)}
                                variant={"contained"}
                                color={"secondary"}
                            >
                                新增
                            </Button>
                            <div className={classes.tableContainer}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>名稱</TableCell>
                                            <TableCell>單價</TableCell>
                                            <TableCell>時長</TableCell>
                                            <TableCell>高亮</TableCell>
                                            <TableCell>操作</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {groups.map((row) => (
                                            <TableRow key={row.id}>
                                                <TableCell
                                                    component="th"
                                                    scope="row"
                                                >
                                                    {row.name}
                                                </TableCell>
                                                <TableCell>
                                                    ￥{row.price / 100}
                                                    {row.score !== 0 &&
                                                        " 或 " +
                                                            row.score +
                                                            " 積分"}
                                                </TableCell>
                                                <TableCell>
                                                    {Math.ceil(
                                                        row.time / 86400
                                                    )}
                                                    天
                                                </TableCell>
                                                <TableCell>
                                                    {row.highlight
                                                        ? "是"
                                                        : "否"}
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        onClick={() => {
                                                            setGroupEdit(row);
                                                            setAddGroup(true);
                                                        }}
                                                        size={"small"}
                                                    >
                                                        <Edit />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={() =>
                                                            deleteGroup(row.id)
                                                        }
                                                        size={"small"}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {tab === 3 && (
                        <div>
                            <Button
                                onClick={() => setAddRedeem(true)}
                                variant={"contained"}
                                color={"secondary"}
                            >
                                新增
                            </Button>
                            <div className={classes.tableContainer}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>#</TableCell>
                                            <TableCell>商品名</TableCell>
                                            <TableCell>數量</TableCell>
                                            <TableCell>兌換碼</TableCell>
                                            <TableCell>狀態</TableCell>
                                            <TableCell>操作</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {redeems.map((row) => (
                                            <TableRow key={row.ID}>
                                                <TableCell
                                                    component="th"
                                                    scope="row"
                                                >
                                                    {row.ID}
                                                </TableCell>
                                                <TableCell>
                                                    {row.ProductID === 0 &&
                                                        "積分"}
                                                    {product[row.ProductID] !==
                                                        undefined && (
                                                        <>
                                                            {
                                                                product[
                                                                    row
                                                                        .ProductID
                                                                ]
                                                            }
                                                        </>
                                                    )}
                                                    {row.ProductID !== 0 &&
                                                        !product[
                                                            row.ProductID
                                                        ] &&
                                                        "已失效商品"}
                                                </TableCell>
                                                <TableCell>{row.Num}</TableCell>
                                                <TableCell>
                                                    {row.Code}
                                                </TableCell>
                                                <TableCell>
                                                    {!row.Used ? (
                                                        <Box color="success.main">
                                                            未使用
                                                        </Box>
                                                    ) : (
                                                        <Box color="warning.main">
                                                            已使用
                                                        </Box>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        onClick={() =>
                                                            deleteRedeem(row.ID)
                                                        }
                                                        size={"small"}
                                                    >
                                                        <Delete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className={classes.navigator}>
                                <Pagination
                                    count={Math.ceil(total / pageSize)}
                                    onChange={(e, v) => setPage(v)}
                                    color="secondary"
                                />
                            </div>
                        </div>
                    )}

                    <AddPack
                        onSubmit={handleAddPack}
                        open={addPack}
                        packEdit={packEdit}
                        onClose={() => {
                            setAddPack(false);
                            setPackEdit(null);
                        }}
                    />
                    <AddGroup
                        onSubmit={handleAddGroup}
                        open={addGroup}
                        groupEdit={groupEdit}
                        onClose={() => {
                            setAddGroup(false);
                            setGroupEdit(null);
                        }}
                    />
                    <AddRedeem
                        open={addRedeem}
                        onSuccess={redeemGenerated}
                        products={[...groups, ...packs]}
                        onClose={() => setAddRedeem(false)}
                    />
                    <AlertDialog
                        title={"產生結果"}
                        open={redeemsResOpen}
                        msg={redeemsRes.map((v, k) => (
                            <div key={k}>{v}</div>
                        ))}
                        onClose={() => {
                            setRedeemsResOpen(false);
                            setRedeemsRes([]);
                        }}
                    />
                </div>
            </Paper>
        </div>
    );
}
