import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { ScoredResource, UserRole, GeoLocation } from '../types';
import { useI18n } from '../i18n/context';

const COLORS: Record<UserRole, string> = {
  family: '#2d7a4f',
  donor: '#1565c0',
  volunteer: '#6a1b9a',
};

function createNumberedIcon(n: number, role: UserRole, isSelected: boolean): L.DivIcon {
  const color = COLORS[role];
  const size = isSelected ? 32 : 26;
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;height:${size}px;border-radius:50%;
      background:${color};color:white;
      display:flex;align-items:center;justify-content:center;
      font-size:${isSelected ? 14 : 12}px;font-weight:700;
      border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);
      ${isSelected ? 'transform:scale(1.2);z-index:999;' : ''}
    ">${n}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const homeIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:30px;height:30px;border-radius:50%;
    background:#ff7043;color:white;
    display:flex;align-items:center;justify-content:center;
    font-size:16px;
    border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);
  ">🏠</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 11);
  }, [center, map]);
  return null;
}

interface Props {
  results: ScoredResource[];
  userLoc: GeoLocation | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  role: UserRole;
}

export default function MapView({ results, userLoc, selectedId, onSelect, role }: Props) {
  const { t } = useI18n();
  const center: [number, number] = userLoc ? [userLoc.lat, userLoc.lng] : [38.9072, -77.0369];

  return (
    <MapContainer center={center} zoom={11} scrollWheelZoom={true}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <RecenterMap center={center} />

      {userLoc && (
        <Marker position={[userLoc.lat, userLoc.lng]} icon={homeIcon}>
          <Popup>{t.common.useMyLocation}</Popup>
        </Marker>
      )}

      {results.map((sr, i) => {
        const isSelected = selectedId === sr.resource.id;
        return (
          <Marker
            key={sr.resource.id}
            position={[sr.resource.lat, sr.resource.lng]}
            icon={createNumberedIcon(i + 1, role, isSelected)}
            eventHandlers={{
              click: () => onSelect(isSelected ? null : sr.resource.id),
            }}
            zIndexOffset={isSelected ? 1000 : 0}
          >
            <Popup>
              <div style={{ maxWidth: 220 }}>
                <strong>{sr.resource.organizationName}</strong>
                <br />{sr.resource.address}
                <br /><em>{sr.resource.operatingHours}</em>
                <br />
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(sr.resource.address)}`}
                  target="_blank" rel="noopener noreferrer"
                >
                  {t.common.directions}
                </a>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
