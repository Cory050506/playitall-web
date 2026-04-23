import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "@/app/page";
import LoginPage from "@/app/login/page";
import LibraryPage from "@/app/library/page";
import SearchPage from "@/app/search/page";
import SettingsPage from "@/app/settings/page";
import AppearanceSettingsPage from "@/app/settings/appearance/page";
import LibrarySettingsPage from "@/app/settings/library/page";
import QualitySettingsPage from "@/app/settings/quality/page";
import OfflineSettingsPage from "@/app/settings/offline/page";
import LibraryCollectionPage from "@/app/library/[kind]/page";
import AlbumDetailPage from "@/app/library/albums/[id]/page";
import ArtistDetailPage from "@/app/library/artists/[id]/page";
import GenreDetailPage from "@/app/library/genres/[name]/page";
import PlaylistDetailPage from "@/app/library/playlists/[id]/page";

export function DesktopApp() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/library/:kind" element={<LibraryCollectionPage />} />
      <Route path="/library/albums/:id" element={<AlbumDetailPage />} />
      <Route path="/library/artists/:id" element={<ArtistDetailPage />} />
      <Route path="/library/genres/:name" element={<GenreDetailPage />} />
      <Route path="/library/playlists/:id" element={<PlaylistDetailPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/settings/appearance" element={<AppearanceSettingsPage />} />
      <Route path="/settings/library" element={<LibrarySettingsPage />} />
      <Route path="/settings/quality" element={<QualitySettingsPage />} />
      <Route path="/settings/offline" element={<OfflineSettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
