import React, { useCallback, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { applyThemes, setSessionStatus, toggleSnackbar } from "../../actions";
import Notice from "../Share/NotFound";
import { useHistory, useLocation } from "react-router";
import API from "../../middleware/Api";
import Auth from "../../middleware/Auth";
import { enableUploaderLoad } from "../../middleware/Init";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function QQCallback() {
    const query = useQuery();
    const location = useLocation();
    const history = useHistory();
    const dispatch = useDispatch();
    const ToggleSnackbar = useCallback(
        (vertical, horizontal, msg, color) =>
            dispatch(toggleSnackbar(vertical, horizontal, msg, color)),
        [dispatch]
    );
    const ApplyThemes = useCallback((theme) => dispatch(applyThemes(theme)), [
        dispatch,
    ]);
    const SetSessionStatus = useCallback(
        (status) => dispatch(setSessionStatus(status)),
        [dispatch]
    );

    const [msg, setMsg] = useState("");

    const afterLogin = (data) => {
        Auth.authenticate(data);

        // 設定使用者主題色
        if (data["preferred_theme"] !== "") {
            ApplyThemes(data["preferred_theme"]);
        }
        enableUploaderLoad();

        // 設定登錄狀態
        SetSessionStatus(true);

        history.push("/home");
        ToggleSnackbar("top", "right", "登錄成功", "success");

        localStorage.removeItem("siteConfigCache");
    };

    useEffect(() => {
        if (query.get("error_description")) {
            setMsg(query.get("error_description"));
            return;
        }
        if (query.get("code") === null) {
            return;
        }
        API.post("/callback/qq", {
            code: query.get("code"),
            state: query.get("state"),
        })
            .then((response) => {
                if (response.rawData.code === 203) {
                    afterLogin(response.data);
                } else {
                    history.push(response.data);
                }
            })
            .catch((error) => {
                setMsg(error.message);
            });
        // eslint-disable-next-line
    }, [location]);

    return <>{msg !== "" && <Notice msg={msg} />}</>;
}
