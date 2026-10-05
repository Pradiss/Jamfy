import { Phone } from "lucide-react";
import {
  SiInstagram,
  SiFacebook,
  SiYoutube,
  SiSpotify,
  SiTiktok,
  SiWhatsapp,
} from "react-icons/si";

type IconProps = { className?: string };

export function InstagramIcon({ className = "h-4 w-4" }: IconProps) {
  return <SiInstagram className={className} />;
}

export function FacebookIcon({ className = "h-4 w-4" }: IconProps) {
  return <SiFacebook className={className} />;
}

export function YoutubeIcon({ className = "h-4 w-4" }: IconProps) {
  return <SiYoutube className={className} />;
}

export function SpotifyIcon({ className = "h-4 w-4" }: IconProps) {
  return <SiSpotify className={className} />;
}

export function TiktokIcon({ className = "h-4 w-4" }: IconProps) {
  return <SiTiktok className={className} />;
}

export function WhatsappIcon({ className = "h-4 w-4" }: IconProps) {
  return <SiWhatsapp className={className} />;
}

export function PhoneIcon({ className = "h-4 w-4" }: IconProps) {
  return <Phone className={className} />;
}
