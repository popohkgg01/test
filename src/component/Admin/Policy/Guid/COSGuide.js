import { lighten, makeStyles } from "@material-ui/core/styles";
import React, { useCallback, useState } from "react";
import Stepper from "@material-ui/core/Stepper";
import StepLabel from "@material-ui/core/StepLabel";
import Step from "@material-ui/core/Step";
import Typography from "@material-ui/core/Typography";
import { useDispatch } from "react-redux";
import { toggleSnackbar } from "../../../../actions";
import Link from "@material-ui/core/Link";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import Collapse from "@material-ui/core/Collapse";
import Button from "@material-ui/core/Button";
import API from "../../../../middleware/Api";
import MagicVar from "../../Dialogs/MagicVar";
import DomainInput from "../../Common/DomainInput";
import SizeInput from "../../Common/SizeInput";
import { useHistory } from "react-router";
import { getNumber } from "../../../../utils";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";

const useStyles = makeStyles((theme) => ({
    stepContent: {
        padding: "16px 32px 16px 32px",
    },
    form: {
        maxWidth: 400,
        marginTop: 20,
    },
    formContainer: {
        [theme.breakpoints.up("md")]: {
            padding: "0px 24px 0 24px",
        },
    },
    subStepContainer: {
        display: "flex",
        marginBottom: 20,
        padding: 10,
        transition: theme.transitions.create("background-color", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        "&:focus-within": {
            backgroundColor: theme.palette.background.default,
        },
    },
    stepNumber: {
        width: 20,
        height: 20,
        backgroundColor: lighten(theme.palette.secondary.light, 0.2),
        color: theme.palette.secondary.contrastText,
        textAlign: "center",
        borderRadius: " 50%",
    },
    stepNumberContainer: {
        marginRight: 10,
    },
    stepFooter: {
        marginTop: 32,
    },
    button: {
        marginRight: theme.spacing(1),
    },
    viewButtonLabel: { textTransform: "none" },
    "@global": {
        code: {
            color: "rgba(0, 0, 0, 0.87)",
            display: "inline-block",
            padding: "2px 6px",
            fontFamily:
                ' Consolas, "Liberation Mono", Menlo, Courier, monospace',
            borderRadius: "2px",
            backgroundColor: "rgba(255,229,100,0.1)",
        },
    },
}));

const steps = [
    {
        title: "儲存空間",
        optional: false,
    },
    {
        title: "上傳路徑",
        optional: false,
    },
    {
        title: "直鏈設定",
        optional: false,
    },
    {
        title: "上傳限制",
        optional: false,
    },
    {
        title: "跨域策略",
        optional: true,
    },
    {
        title: "云函式回撥",
        optional: true,
    },
    {
        title: "完成",
        optional: false,
    },
];

export default function COSGuide(props) {
    const classes = useStyles();
    const history = useHistory();

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [skipped, setSkipped] = React.useState(new Set());
    const [magicVar, setMagicVar] = useState("");
    const [useCDN, setUseCDN] = useState("false");
    const [policy, setPolicy] = useState(
        props.policy
            ? props.policy
            : {
                  Type: "cos",
                  Name: "",
                  SecretKey: "",
                  AccessKey: "",
                  BaseURL: "",
                  Server: "",
                  IsPrivate: "true",
                  DirNameRule: "uploads/{year}/{month}/{day}",
                  AutoRename: "true",
                  FileNameRule: "{randomkey8}_{originname}",
                  IsOriginLinkEnable: "false",
                  MaxSize: "0",
                  OptionsSerialized: {
                      file_type: "",
                  },
              }
    );
    const [policyID, setPolicyID] = useState(
        props.policy ? props.policy.ID : 0
    );
    const [region, setRegion] = useState("ap-chengdu");

    const handleChange = (name) => (event) => {
        setPolicy({
            ...policy,
            [name]: event.target.value,
        });
    };

    const handleOptionChange = (name) => (event) => {
        setPolicy({
            ...policy,
            OptionsSerialized: {
                ...policy.OptionsSerialized,
                [name]: event.target.value,
            },
        });
    };

    const isStepSkipped = (step) => {
        return skipped.has(step);
    };

    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );

    const submitPolicy = (e) => {
        e.preventDefault();
        setLoading(true);

        const policyCopy = { ...policy };
        policyCopy.OptionsSerialized = { ...policyCopy.OptionsSerialized };

        if (useCDN === "false") {
            policyCopy.BaseURL = policy.Server;
        }

        // 型別轉換
        policyCopy.AutoRename = policyCopy.AutoRename === "true";
        policyCopy.IsOriginLinkEnable =
            policyCopy.IsOriginLinkEnable === "true";
        policyCopy.IsPrivate = policyCopy.IsPrivate === "true";
        policyCopy.MaxSize = parseInt(policyCopy.MaxSize);
        policyCopy.OptionsSerialized.file_type = policyCopy.OptionsSerialized.file_type.split(
            ","
        );
        if (
            policyCopy.OptionsSerialized.file_type.length === 1 &&
            policyCopy.OptionsSerialized.file_type[0] === ""
        ) {
            policyCopy.OptionsSerialized.file_type = [];
        }

        API.post("/admin/policy", {
            policy: policyCopy,
        })
            .then((response) => {
                ToggleSnackbar(
                    "top",
                    "right",
                    "儲存策略已" + (props.policy ? "儲存" : "新增"),
                    "success"
                );
                setActiveStep(4);
                setPolicyID(response.data);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });

        setLoading(false);
    };

    const createCORS = () => {
        setLoading(true);
        API.post("/admin/policy/cors", {
            id: policyID,
        })
            .then(() => {
                ToggleSnackbar("top", "right", "跨域策略已新增", "success");
                setActiveStep(5);
            })
            .catch((error) => {
                ToggleSnackbar("top", "right", error.message, "error");
            })
            .then(() => {
                setLoading(false);
            });
    };

    const creatCallback = () => {
        setLoading(true);
        API.post("/admin/policy/scf", {
            id: policyID,
            region: region,
        })
            .then(() => {
                ToggleSnackbar("top", "right", "回撥云函式已新增", "success");
                setActiveStep(6);
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
            <Typography variant={"h6"}>
                {props.policy ? "修改" : "新增"} 騰訊云 COS 儲存策略
            </Typography>
            <Stepper activeStep={activeStep}>
                {steps.map((label, index) => {
                    const stepProps = {};
                    const labelProps = {};
                    if (label.optional) {
                        labelProps.optional = (
                            <Typography variant="caption">可選</Typography>
                        );
                    }
                    if (isStepSkipped(index)) {
                        stepProps.completed = false;
                    }
                    return (
                        <Step key={label.title} {...stepProps}>
                            <StepLabel {...labelProps}>{label.title}</StepLabel>
                        </Step>
                    );
                })}
            </Stepper>

            {activeStep === 0 && (
                <form
                    className={classes.stepContent}
                    onSubmit={(e) => {
                        e.preventDefault();
                        setActiveStep(1);
                    }}
                >
                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>0</div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                在使用 騰訊云 COS 儲策略前，請確保您在 參數設定
                                - 站點資訊 - 站點URL 中填寫的
                                地址與實際相符，並且
                                <strong>能夠被外網正常訪問</strong>。
                            </Typography>
                        </div>
                    </div>

                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>1</div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                前往
                                <Link
                                    href={
                                        "https://console.cloud.tencent.com/cos5"
                                    }
                                    target={"_blank"}
                                >
                                    COS 管理控制檯
                                </Link>
                                建立儲存桶。
                            </Typography>
                        </div>
                    </div>

                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>2</div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                轉到所建立儲存桶的基礎配置頁面，將
                                <code>空間名稱</code>填寫在下方：
                            </Typography>
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-helper">
                                        空間名稱
                                    </InputLabel>
                                    <Input
                                        inputProps={{
                                            pattern: "[a-z0-9-]+-[0-9]+",
                                            title:
                                                "空間名格式不正確, 舉例：ccc-1252109809",
                                        }}
                                        required
                                        value={policy.BucketName}
                                        onChange={handleChange("BucketName")}
                                    />
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>3</div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                在下方選擇您建立的空間的訪問許可權型別，推薦選擇
                                <code>私有讀寫</code>
                                以獲得更高的安全性，私有空間無法開啟「獲取直鏈」功能。
                            </Typography>
                            <div className={classes.form}>
                                <FormControl required component="fieldset">
                                    <RadioGroup
                                        required
                                        value={policy.IsPrivate}
                                        onChange={handleChange("IsPrivate")}
                                        row
                                    >
                                        <FormControlLabel
                                            value={"true"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label="私有讀寫"
                                        />
                                        <FormControlLabel
                                            value={"false"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label="公共讀私有寫"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>4</div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                轉到所建立 Bucket 的基礎配置，填寫
                                <code>基本資訊</code>欄目下 給出的{" "}
                                <code>訪問域名</code>
                            </Typography>
                            <div className={classes.form}>
                                <DomainInput
                                    value={policy.Server}
                                    onChange={handleChange("Server")}
                                    required
                                    label={"訪問域名"}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>5</div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                是否要使用配套的 騰訊云CDN 加速 COS 訪問？
                            </Typography>
                            <div className={classes.form}>
                                <FormControl required component="fieldset">
                                    <RadioGroup
                                        required
                                        value={useCDN}
                                        onChange={(e) => {
                                            setUseCDN(e.target.value);
                                        }}
                                        row
                                    >
                                        <FormControlLabel
                                            value={"true"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label="使用"
                                        />
                                        <FormControlLabel
                                            value={"false"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label="不使用"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    <Collapse in={useCDN === "true"}>
                        <div className={classes.subStepContainer}>
                            <div className={classes.stepNumberContainer}>
                                <div className={classes.stepNumber}>6</div>
                            </div>
                            <div className={classes.subStepContent}>
                                <Typography variant={"body2"}>
                                    前往
                                    <Link
                                        href={
                                            "https://console.cloud.tencent.com/cdn/access/guid"
                                        }
                                        target={"_blank"}
                                    >
                                        騰訊云 CDN 管理控制檯
                                    </Link>
                                    建立 CDN 加速域名，並設定源站為剛建立的 COS
                                    儲存桶。在下方填寫 CDN
                                    加速域名，並選擇是否使用 HTTPS：
                                </Typography>
                                <div className={classes.form}>
                                    <DomainInput
                                        value={policy.BaseURL}
                                        onChange={handleChange("BaseURL")}
                                        required={useCDN === "true"}
                                        label={"CDN 加速域名"}
                                    />
                                </div>
                            </div>
                        </div>
                    </Collapse>

                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>
                                {getNumber(6, [useCDN === "true"])}
                            </div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                在騰訊云
                                <Link
                                    href={
                                        "https://console.cloud.tencent.com/cam/capi"
                                    }
                                    target={"_blank"}
                                >
                                    訪問金鑰
                                </Link>
                                頁面獲取
                                一對訪問金鑰，並填寫在下方。請確保這對金鑰擁有
                                COS 和 SCF 服務的訪問許可權。
                            </Typography>
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-helper">
                                        SecretId
                                    </InputLabel>
                                    <Input
                                        required
                                        inputProps={{
                                            pattern: "\\S+",
                                            title: "不能含有空格",
                                        }}
                                        value={policy.AccessKey}
                                        onChange={handleChange("AccessKey")}
                                    />
                                </FormControl>
                            </div>
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-helper">
                                        SecretKey
                                    </InputLabel>
                                    <Input
                                        required
                                        inputProps={{
                                            pattern: "\\S+",
                                            title: "不能含有空格",
                                        }}
                                        value={policy.SecretKey}
                                        onChange={handleChange("SecretKey")}
                                    />
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>
                                {getNumber(7, [useCDN === "true"])}
                            </div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                為此儲存策略命名：
                            </Typography>
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-helper">
                                        儲存策略名
                                    </InputLabel>
                                    <Input
                                        required
                                        value={policy.Name}
                                        onChange={handleChange("Name")}
                                    />
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    <div className={classes.stepFooter}>
                        <Button
                            disabled={loading}
                            type={"submit"}
                            variant={"contained"}
                            color={"primary"}
                        >
                            下一步
                        </Button>
                    </div>
                </form>
            )}

            {activeStep === 1 && (
                <form
                    className={classes.stepContental}
                    onSubmit={(e) => {
                        e.preventDefault();
                        setActiveStep(2);
                    }}
                >
                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>1</div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                請在下方輸入檔案的儲存目錄路徑，可以為絕對路徑或相對路徑（相對於
                                從機的
                                Cloudreve）。路徑中可以使用魔法變數，檔案在上傳時會自動替換這些變數為相應值；
                                可用魔法變數可參考{" "}
                                <Link
                                    color={"secondary"}
                                    href={"javascript:void()"}
                                    onClick={() => setMagicVar("path")}
                                >
                                    路徑魔法變數列表
                                </Link>{" "}
                                。
                            </Typography>
                            <div className={classes.form}>
                                <FormControl fullWidth>
                                    <InputLabel htmlFor="component-helper">
                                        儲存目錄
                                    </InputLabel>
                                    <Input
                                        required
                                        value={policy.DirNameRule}
                                        onChange={handleChange("DirNameRule")}
                                    />
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>2</div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                是否需要對儲存的物理檔案進行重新命名？此處的重新命名不會影響最終呈現給使用者的
                                檔名。檔名也可使用魔法變數，
                                可用魔法變數可參考{" "}
                                <Link
                                    color={"secondary"}
                                    href={"javascript:void()"}
                                    onClick={() => setMagicVar("file")}
                                >
                                    檔名魔法變數列表
                                </Link>{" "}
                                。
                            </Typography>
                            <div className={classes.form}>
                                <FormControl required component="fieldset">
                                    <RadioGroup
                                        aria-label="gender"
                                        name="gender1"
                                        value={policy.AutoRename}
                                        onChange={handleChange("AutoRename")}
                                        row
                                    >
                                        <FormControlLabel
                                            value={"true"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label="開啟重新命名"
                                        />
                                        <FormControlLabel
                                            value={"false"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label="不開啟"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </div>

                            <Collapse in={policy.AutoRename === "true"}>
                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            命名規則
                                        </InputLabel>
                                        <Input
                                            required={
                                                policy.AutoRename === "true"
                                            }
                                            value={policy.FileNameRule}
                                            onChange={handleChange(
                                                "FileNameRule"
                                            )}
                                        />
                                    </FormControl>
                                </div>
                            </Collapse>
                        </div>
                    </div>

                    <div className={classes.stepFooter}>
                        <Button
                            color={"default"}
                            className={classes.button}
                            onClick={() => setActiveStep(0)}
                        >
                            上一步
                        </Button>
                        <Button
                            disabled={loading}
                            type={"submit"}
                            variant={"contained"}
                            color={"primary"}
                        >
                            下一步
                        </Button>
                    </div>
                </form>
            )}

            {activeStep === 2 && (
                <form
                    className={classes.stepContent}
                    onSubmit={(e) => {
                        e.preventDefault();
                        setActiveStep(3);
                    }}
                >
                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>1</div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                是否允許獲取檔案永久直鏈？
                                <br />
                                開啟后，使用者可以請求獲得能直接訪問到檔案內容的直鏈，適用於圖床應用或自用。
                            </Typography>

                            <div className={classes.form}>
                                <FormControl required component="fieldset">
                                    <RadioGroup
                                        required
                                        value={policy.IsOriginLinkEnable}
                                        onChange={(e) => {
                                            if (
                                                policy.IsPrivate === "true" &&
                                                e.target.value === "true"
                                            ) {
                                                ToggleSnackbar(
                                                    "top",
                                                    "right",
                                                    "私有空間無法開啟此功能",
                                                    "warning"
                                                );
                                                return;
                                            }
                                            handleChange("IsOriginLinkEnable")(
                                                e
                                            );
                                        }}
                                        row
                                    >
                                        <FormControlLabel
                                            value={"true"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label="允許"
                                        />
                                        <FormControlLabel
                                            value={"false"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label="禁止"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    <div className={classes.stepFooter}>
                        <Button
                            color={"default"}
                            className={classes.button}
                            onClick={() => setActiveStep(1)}
                        >
                            上一步
                        </Button>{" "}
                        <Button
                            disabled={loading}
                            type={"submit"}
                            variant={"contained"}
                            color={"primary"}
                        >
                            下一步
                        </Button>
                    </div>
                </form>
            )}

            {activeStep === 3 && (
                <form className={classes.stepContent} onSubmit={submitPolicy}>
                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>1</div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                是否限制上傳的單檔案大小？
                            </Typography>

                            <div className={classes.form}>
                                <FormControl required component="fieldset">
                                    <RadioGroup
                                        required
                                        value={
                                            policy.MaxSize === "0"
                                                ? "false"
                                                : "true"
                                        }
                                        onChange={(e) => {
                                            if (e.target.value === "true") {
                                                setPolicy({
                                                    ...policy,
                                                    MaxSize: "10485760",
                                                });
                                            } else {
                                                setPolicy({
                                                    ...policy,
                                                    MaxSize: "0",
                                                });
                                            }
                                        }}
                                        row
                                    >
                                        <FormControlLabel
                                            value={"true"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label="限制"
                                        />
                                        <FormControlLabel
                                            value={"false"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label="不限制"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    <Collapse in={policy.MaxSize !== "0"}>
                        <div className={classes.subStepContainer}>
                            <div className={classes.stepNumberContainer}>
                                <div className={classes.stepNumber}>2</div>
                            </div>
                            <div className={classes.subStepContent}>
                                <Typography variant={"body2"}>
                                    輸入限制：
                                </Typography>
                                <div className={classes.form}>
                                    <SizeInput
                                        value={policy.MaxSize}
                                        onChange={handleChange("MaxSize")}
                                        min={0}
                                        max={9223372036854775807}
                                        label={"單檔案大小限制"}
                                    />
                                </div>
                            </div>
                        </div>
                    </Collapse>

                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer}>
                            <div className={classes.stepNumber}>
                                {policy.MaxSize !== "0" ? "3" : "2"}
                            </div>
                        </div>
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                是否限制上傳副檔名？
                            </Typography>

                            <div className={classes.form}>
                                <FormControl required component="fieldset">
                                    <RadioGroup
                                        required
                                        value={
                                            policy.OptionsSerialized
                                                .file_type === ""
                                                ? "false"
                                                : "true"
                                        }
                                        onChange={(e) => {
                                            if (e.target.value === "true") {
                                                setPolicy({
                                                    ...policy,
                                                    OptionsSerialized: {
                                                        ...policy.OptionsSerialized,
                                                        file_type:
                                                            "jpg,png,mp4,zip,rar",
                                                    },
                                                });
                                            } else {
                                                setPolicy({
                                                    ...policy,
                                                    OptionsSerialized: {
                                                        ...policy.OptionsSerialized,
                                                        file_type: "",
                                                    },
                                                });
                                            }
                                        }}
                                        row
                                    >
                                        <FormControlLabel
                                            value={"true"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label="限制"
                                        />
                                        <FormControlLabel
                                            value={"false"}
                                            control={
                                                <Radio color={"primary"} />
                                            }
                                            label="不限制"
                                        />
                                    </RadioGroup>
                                </FormControl>
                            </div>
                        </div>
                    </div>

                    <Collapse in={policy.OptionsSerialized.file_type !== ""}>
                        <div className={classes.subStepContainer}>
                            <div className={classes.stepNumberContainer}>
                                <div className={classes.stepNumber}>
                                    {policy.MaxSize !== "0" ? "4" : "3"}
                                </div>
                            </div>
                            <div className={classes.subStepContent}>
                                <Typography variant={"body2"}>
                                    輸入允許上傳的副檔名，多個請以半形逗號 ,
                                    隔開
                                </Typography>
                                <div className={classes.form}>
                                    <FormControl fullWidth>
                                        <InputLabel htmlFor="component-helper">
                                            副檔名列表
                                        </InputLabel>
                                        <Input
                                            value={
                                                policy.OptionsSerialized
                                                    .file_type
                                            }
                                            onChange={handleOptionChange(
                                                "file_type"
                                            )}
                                        />
                                    </FormControl>
                                </div>
                            </div>
                        </div>
                    </Collapse>

                    <div className={classes.stepFooter}>
                        <Button
                            color={"default"}
                            className={classes.button}
                            onClick={() => setActiveStep(2)}
                        >
                            上一步
                        </Button>{" "}
                        <Button
                            disabled={loading}
                            type={"submit"}
                            variant={"contained"}
                            color={"primary"}
                        >
                            下一步
                        </Button>
                    </div>
                </form>
            )}

            {activeStep === 4 && (
                <form className={classes.stepContent}>
                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer} />
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                COS 儲存桶 需要正確配置跨域策略后才能使用 Web
                                端上傳檔案，Cloudreve
                                可以幫您自動設定，您也可以參考文件步驟手動設定。如果您已設定過此
                                Bucket 的跨域策略，此步驟可以跳過。
                            </Typography>
                            <div className={classes.form}>
                                <Button
                                    disabled={loading}
                                    color={"secondary"}
                                    variant={"contained"}
                                    className={classes.button}
                                    onClick={() => createCORS()}
                                    classes={{ label: classes.viewButtonLabel }}
                                >
                                    讓 Cloudreve 幫我設定
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className={classes.stepFooter}>
                        <Button
                            color={"default"}
                            className={classes.button}
                            onClick={() => {
                                setActiveStep(
                                    (prevActiveStep) => prevActiveStep + 1
                                );
                                setSkipped((prevSkipped) => {
                                    const newSkipped = new Set(
                                        prevSkipped.values()
                                    );
                                    newSkipped.add(activeStep);
                                    return newSkipped;
                                });
                            }}
                        >
                            跳過
                        </Button>{" "}
                    </div>
                </form>
            )}

            {activeStep === 5 && (
                <form className={classes.stepContent}>
                    <div className={classes.subStepContainer}>
                        <div className={classes.stepNumberContainer} />
                        <div className={classes.subStepContent}>
                            <Typography variant={"body2"}>
                                COS 儲存桶 客戶端直傳需要藉助騰訊云的
                                <Link
                                    href={
                                        "https://console.cloud.tencent.com/scf/index?rid=16"
                                    }
                                    target={"_blank"}
                                >
                                    云函式
                                </Link>
                                產品以確保上傳回調可控。如果您打算將此儲存策略自用，或者分配給可信賴使用者組，此步驟可以跳過。
                                如果是作為公有使用，請務必建立回撥云函式。
                                <br />
                                <br />
                            </Typography>
                            <Typography variant={"body2"}>
                                Cloudreve 可以嘗試幫你自動建立回撥云函式，請選擇
                                COS 儲存桶 所在地域後繼續。
                                建立可能會花費數秒鐘，請耐心等待。建立前請確保您的騰訊云賬號已開啟云函式服務。
                            </Typography>

                            <div className={classes.form}>
                                <FormControl>
                                    <InputLabel htmlFor="component-helper">
                                        儲存桶所在地區
                                    </InputLabel>
                                    <Select
                                        value={region}
                                        onChange={(e) =>
                                            setRegion(e.target.value)
                                        }
                                        required
                                    >
                                        <MenuItem value={"ap-beijing"}>
                                            華北地區(北京)
                                        </MenuItem>
                                        <MenuItem value={"ap-chengdu"}>
                                            西南地區(成都)
                                        </MenuItem>
                                        <MenuItem value={"ap-guangzhou"}>
                                            華南地區(廣州)
                                        </MenuItem>
                                        <MenuItem value={"ap-guangzhou-open"}>
                                            華南地區(廣州Open)
                                        </MenuItem>
                                        <MenuItem value={"ap-hongkong"}>
                                            港澳臺地區(中國香港)
                                        </MenuItem>
                                        <MenuItem value={"ap-mumbai"}>
                                            亞太南部(孟買)
                                        </MenuItem>
                                        <MenuItem value={"ap-shanghai"}>
                                            華東地區(上海)
                                        </MenuItem>
                                        <MenuItem value={"ap-singapore"}>
                                            亞太東南(新加坡)
                                        </MenuItem>
                                        <MenuItem value={"na-siliconvalley"}>
                                            美國西部(硅谷)
                                        </MenuItem>
                                        <MenuItem value={"na-toronto"}>
                                            北美地區(多倫多)
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </div>

                            <div className={classes.form}>
                                <Button
                                    disabled={loading}
                                    color={"secondary"}
                                    variant={"contained"}
                                    className={classes.button}
                                    onClick={() => creatCallback()}
                                    classes={{ label: classes.viewButtonLabel }}
                                >
                                    讓 Cloudreve 幫我建立
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className={classes.stepFooter}>
                        <Button
                            color={"default"}
                            className={classes.button}
                            onClick={() => {
                                setActiveStep(
                                    (prevActiveStep) => prevActiveStep + 1
                                );
                                setSkipped((prevSkipped) => {
                                    const newSkipped = new Set(
                                        prevSkipped.values()
                                    );
                                    newSkipped.add(activeStep);
                                    return newSkipped;
                                });
                            }}
                        >
                            跳過
                        </Button>{" "}
                    </div>
                </form>
            )}

            {activeStep === 6 && (
                <>
                    <form className={classes.stepContent}>
                        <Typography>
                            儲存策略已{props.policy ? "儲存" : "新增"}！
                        </Typography>
                        <Typography variant={"body2"} color={"textSecondary"}>
                            要使用此儲存策略，請到使用者組管理頁面，為相應使用者組繫結此儲存策略。
                        </Typography>
                    </form>
                    <div className={classes.stepFooter}>
                        <Button
                            color={"primary"}
                            className={classes.button}
                            onClick={() => history.push("/admin/policy")}
                        >
                            返回儲存策略列表
                        </Button>
                    </div>
                </>
            )}

            <MagicVar
                open={magicVar === "file"}
                isFile
                onClose={() => setMagicVar("")}
            />
            <MagicVar
                open={magicVar === "path"}
                onClose={() => setMagicVar("")}
            />
        </div>
    );
}
