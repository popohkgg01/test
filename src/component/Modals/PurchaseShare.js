import React from "react";
import { Dialog } from "@material-ui/core";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import DialogContentText from "@material-ui/core/DialogContentText";

export default function PurchaseShareDialog(props) {
    return (
        <Dialog
            open={props.callback}
            onClose={props.onClose}
            aria-labelledby="form-dialog-title"
        >
            <DialogTitle id="alert-dialog-title">
                確定要支付 {props.score}積分 購買此分享？
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    購買后，您可以自由預覽、下載此分享的所有內容，一定期限內不會重複扣費。
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.onClose}>取消</Button>
                <Button
                    onClick={() => props.callback()}
                    color="primary"
                    autoFocus
                >
                    確定
                </Button>
            </DialogActions>
        </Dialog>
    );
}
