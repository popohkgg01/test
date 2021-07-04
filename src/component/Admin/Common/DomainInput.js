import React, { useEffect, useState } from "react";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Input from "@material-ui/core/Input";
import InputAdornment from "@material-ui/core/InputAdornment";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormHelperText from "@material-ui/core/FormHelperText";

export default function DomainInput({ onChange, value, required, label }) {
    const [domain, setDomain] = useState("");
    const [protocol, setProtocol] = useState("https://");
    const [error, setError] = useState();

    useState(() => {
        value = value ? value : "";
        if (value.startsWith("https://")) {
            setDomain(value.replace("https://", ""));
            setProtocol("https://");
        } else {
            if (value !== "") {
                setDomain(value.replace("http://", ""));
                setProtocol("http://");
            }
        }
    }, [value]);

    useEffect(() => {
        if (protocol === "http://" && window.location.protocol === "https:") {
            setError(
                "您目前站點啟用了 HTTPS ，此處選擇 HTTP 可能會導致無法連線。"
            );
        } else {
            setError("");
        }
    }, [protocol]);

    return (
        <FormControl>
            <InputLabel htmlFor="component-helper">{label}</InputLabel>
            <Input
                error={error !== ""}
                value={domain}
                onChange={(e) => {
                    setDomain(e.target.value);
                    onChange({
                        target: {
                            value: protocol + e.target.value,
                        },
                    });
                }}
                required={required}
                startAdornment={
                    <InputAdornment position="start">
                        <Select
                            value={protocol}
                            onChange={(e) => {
                                setProtocol(e.target.value);
                                onChange({
                                    target: {
                                        value: e.target.value + domain,
                                    },
                                });
                            }}
                        >
                            <MenuItem value={"http://"}>http://</MenuItem>
                            <MenuItem value={"https://"}>https://</MenuItem>
                        </Select>
                    </InputAdornment>
                }
            />
            {error !== "" && (
                <FormHelperText error={error !== ""}>{error}</FormHelperText>
            )}
        </FormControl>
    );
}
