import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { groupBy } from "lodash";
import { Divider, Grid, Typography } from "@material-ui/core";
import useMessage from "@/hooks/useMessage";
import useRequest from "@/hooks/useRequest";
import { CredentialState } from "@/state/credentials";
import { AlbumInfo, AnnilToken } from "@/types/common";
import TrackList from "@/components/TrackList";
import { TrackItem } from "@/components/TrackList/types";
import AlbumCover from "./components/AlbumCover";
import AlbumBasicInfo from "./components/AlbumBasicInfo";
import { getAlbumInfo, getAlbumAvailableLibraries } from "./services";
import styles from "./index.module.scss";

const AlbumDetail: React.FC = () => {
    const [_, { addMessage }] = useMessage();
    const { credentials: allAvailableCredentials } = useRecoilValue(CredentialState);
    const [credential, setCredential] = useState<AnnilToken | undefined>(undefined);
    const { id: albumId } = useParams<{ id: string }>();
    const [availableLibraries, loadingAvailableLibraries] = useRequest(() =>
        getAlbumAvailableLibraries(albumId)
    );
    const [albumInfo, setAlbumInfo] = useState<AlbumInfo | undefined>();
    useEffect(() => {
        (async () => {
            if (albumId) {
                try {
                    const albumInfoResponse = await getAlbumInfo(albumId);
                    albumInfoResponse && setAlbumInfo(albumInfoResponse);
                } catch (e) {
                    if (e instanceof Error) {
                        addMessage("error", e.message);
                    }
                }
            }
        })();
    }, [albumId, addMessage]);
    useEffect(() => {
        if (!albumId) {
            addMessage("error", "请指定专辑 ID");
            return;
        }
        if (!allAvailableCredentials?.length) {
            addMessage("error", "无可用音频仓库");
            return;
        }
        if (!availableLibraries?.length) {
            !loadingAvailableLibraries && addMessage("error", "无可提供该专辑资源的音频后端");
            return;
        }
        const credentialUrlMap = groupBy(allAvailableCredentials, "url");
        const librariesByPriority = availableLibraries.sort(
            (a, b) => credentialUrlMap[b][0].priority - credentialUrlMap[a][0].priority
        );
        setCredential(credentialUrlMap[librariesByPriority[0]][0]);
    }, [
        albumId,
        allAvailableCredentials,
        availableLibraries,
        loadingAvailableLibraries,
        addMessage,
    ]);

    return (
        <Grid container justifyContent="center" className={styles.pageContainer}>
            <Grid item xs={12} lg={8}>
                <Grid container spacing={2}>
                    <Grid item xs={12} lg={3}>
                        <AlbumCover albumInfo={albumInfo} credential={credential} />
                    </Grid>
                    <Grid item xs={12} lg={9}>
                        <AlbumBasicInfo albumInfo={albumInfo} />
                    </Grid>
                </Grid>
                <Grid item xs={12} className={styles.divider}>
                    <Divider />
                </Grid>
                <Grid item xs={12}>
                    {!!albumInfo?.discs?.length &&
                        albumInfo.discs.map((disc, discIndex) => {
                            const { tracks } = disc;
                            const { albumId, title: albumTitle } = albumInfo;
                            const trackList: TrackItem[] = tracks.map((track, trackIndex) => ({
                                ...track,
                                discIndex,
                                trackIndex,
                                albumId,
                                albumTitle,
                            }));
                            return (
                                <Grid container flexDirection="column" key={disc.catalog}>
                                    <Grid item xs={12}>
                                        <Typography variant="h5">{`Disc ${
                                            discIndex + 1
                                        }`}</Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TrackList tracks={trackList} />
                                    </Grid>
                                </Grid>
                            );
                        })}
                </Grid>
            </Grid>
        </Grid>
    );
};

export default AlbumDetail;
