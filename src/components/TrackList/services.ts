import { groupBy } from "lodash";
import { AnnilToken, PlaylistInfo, TrackIdentifier } from "@/types/common";
import { default as AlbumDB } from "@/db/album";
import request from "@/api/request";
import { TrackItem } from "./types";

export async function getAvailableLibraryForTrack(
    track: TrackItem,
    allCredentials: AnnilToken[]
): Promise<AnnilToken | undefined> {
    const { albumId } = track;
    const availableLibraries = await AlbumDB.getAvailableLibraries(albumId);
    if (availableLibraries.length > 0) {
        const credentialUrlMap = groupBy(
            allCredentials.filter((c) => availableLibraries.includes(c.url)),
            "url"
        );
        const librariesByPriority = availableLibraries.sort(
            (a, b) => credentialUrlMap[b][0].priority - credentialUrlMap[a][0].priority
        );
        return credentialUrlMap[librariesByPriority[0]][0];
    }
}

export function getPlayUrlForTrack(track: TrackItem, credential: AnnilToken) {
    const { albumId, discIndex, trackIndex } = track;
    const { url, token } = credential;
    return `${url}/${albumId}/${discIndex + 1}/${trackIndex + 1}?auth=${token}`;
}

export function getCoverUrlForTrack(track: TrackItem, credential: AnnilToken) {
    const { albumId, discIndex } = track;
    const { url } = credential;
    return `${url}/${albumId}/${discIndex + 1}/cover`;
}

export function addFavorite(track: TrackItem) {
    const { albumId, discIndex, trackIndex } = track;
    return request.put("/api/favorite/music", {
        albumId,
        discId: discIndex + 1,
        trackId: trackIndex + 1,
    });
}

export function removeFavorite(track: TrackItem) {
    const { albumId, discIndex, trackIndex } = track;
    return request.delete("/api/favorite/music", {
        albumId,
        discId: discIndex + 1,
        trackId: trackIndex + 1,
    });
}

export function createPlaylist({
    name,
    description,
    isPublic,
}: {
    name: string;
    description: string;
    isPublic: boolean;
}) {
    return request.put<PlaylistInfo>("/api/playlist", { name, description, isPublic });
}

export function addTrackToPlaylist({
    playlistId,
    trackId,
}: {
    playlistId: string;
    trackId: TrackIdentifier;
}) {
    return request.patch<PlaylistInfo>("/api/playlist", {
        id: playlistId,
        command: "append",
        payload: [{
            type: "normal",
            ...trackId,
        }],
    });
}
