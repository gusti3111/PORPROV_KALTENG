#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: bash scripts/generate-self-signed-cert.sh <localhost-or-ipv4>" >&2
  exit 2
fi

host=$1
case "$host" in
  localhost)
    subject_alt_names="DNS:localhost,IP:127.0.0.1,IP:::1"
    ;;
  *)
    if [[ ! "$host" =~ ^[0-9]{1,3}(\.[0-9]{1,3}){3}$ ]]; then
      echo "Expected 'localhost' or an IPv4 address." >&2
      exit 2
    fi

    IFS=. read -r octet1 octet2 octet3 octet4 <<< "$host"
    for octet in "$octet1" "$octet2" "$octet3" "$octet4"; do
      if ((10#$octet > 255)); then
        echo "Invalid IPv4 address: $host" >&2
        exit 2
      fi
    done

    subject_alt_names="DNS:localhost,IP:127.0.0.1,IP:::1,IP:$host"
    ;;
esac

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tls_dir="$repo_root/deploy/tls"
certificate="$tls_dir/fullchain.pem"
private_key="$tls_dir/privkey.pem"

if [[ -e "$certificate" || -e "$private_key" ]]; then
  echo "TLS certificate files already exist in $tls_dir; refusing to overwrite them." >&2
  exit 1
fi

mkdir -p "$tls_dir"
openssl req -x509 -newkey rsa:2048 -sha256 -nodes -days 365 \
  -keyout "$private_key" \
  -out "$certificate" \
  -subj "/CN=$host" \
  -addext "subjectAltName=$subject_alt_names"
chmod 600 "$private_key"
chmod 644 "$certificate"

echo "Created a self-signed certificate for $host in $tls_dir."
echo "Browsers will warn until this certificate is explicitly trusted."
