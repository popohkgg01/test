import React from "react";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import Typography from "@material-ui/core/Typography";
import DialogActions from "@material-ui/core/DialogActions";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import Grid from "@material-ui/core/Grid";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import { makeStyles } from "@material-ui/core/styles";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import { useHistory } from "react-router";
import Link from "@material-ui/core/Link";

const useStyles = makeStyles((theme) => ({
    cardContainer: {
        display: "flex",
    },
    cover: {
        width: 100,
        height: 60,
    },
    card: {},
    content: {
        flex: "1 0 auto",
    },
    bg: {
        backgroundColor: theme.palette.background.default,
        padding: "24px 24px",
    },
    dialogFooter: {
        justifyContent: "space-between",
    },
}));

const policies = [
    {
        name: "本機儲存",
        img: "local.png",
        path: "/admin/policy/add/local",
    },
    {
        name: "從機儲存",
        img: "remote.png",
        path: "/admin/policy/add/remote",
    },
    {
        name: "七牛",
        img: "qiniu.png",
        path: "/admin/policy/add/qiniu",
    },
    {
        name: "阿里云 OSS",
        img: "oss.png",
        path: "/admin/policy/add/oss",
    },
    {
        name: "又拍云",
        img: "upyun.png",
        path: "/admin/policy/add/upyun",
    },
    {
        name: "騰訊云 COS",
        img: "cos.png",
        path: "/admin/policy/add/cos",
    },
    {
        name: "OneDrive",
        img: "onedrive.png",
        path: "/admin/policy/add/onedrive",
    },
    {
        name: "Amazon S3",
        img: "s3.png",
        path: "/admin/policy/add/s3",
    },
];

export default function AddPolicy({ open, onClose }) {
    const classes = useStyles();

    const location = useHistory();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            maxWidth={"sm"}
            fullWidth
        >
            <DialogTitle id="alert-dialog-title">選擇儲存方式</DialogTitle>
            <DialogContent dividers className={classes.bg}>
                <Grid container spacing={2}>
                    {policies.map((v, index) => (
                        <Grid key={index} item sm={12} md={6}>
                            <Card className={classes.card}>
                                <CardActionArea
                                    onClick={() => {
                                        location.push(v.path);
                                        onClose();
                                    }}
                                    className={classes.cardContainer}
                                >
                                    <CardMedia
                                        className={classes.cover}
                                        image={"/static/img/" + v.img}
                                    />
                                    <CardContent className={classes.content}>
                                        <Typography
                                            variant="subtitle1"
                                            color="textSecondary"
                                        >
                                            {v.name}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </DialogContent>
            <DialogActions className={classes.dialogFooter}>
                <Button
                    onClick={() =>
                        window.open(
                            "https://docs.cloudreve.org/use/policy/compare"
                        )
                    }
                    color="primary"
                >
                    儲存策略對比
                </Button>
                <Button onClick={onClose} color="primary">
                    取消
                </Button>
            </DialogActions>
        </Dialog>
    );
}
