# Daily Report — Rabu, 4 November

| Item | Value |
| --- | --- |
| Engagement | Satelit SpaceX Arbitrary Code Execution (ACE) (unit lab owned) |
| Klasifikasi | INTERNAL — Security Research Lab |
| Target | Starlink User Terminal (Secure Boot / hardware lock) |

## Hasil & Temuan Hari Ini

### 1. Objective engagement dikunci

Membuktikan apakah mekanisme keamanan hardware dan Secure Boot pada Starlink User Terminal dapat dilewati, sehingga peneliti bisa memperoleh kendali eksekusi kode pada perangkat yang secara normal dikunci oleh SpaceX.

### 2. Checkpoint — 2021–2022: riset akses hardware Starlink

Catatan tahap historis yang sudah diarsipkan di Fornix:

1. **Hardware teardown** — SoC, PCB, konektor, media penyimpanan; revisi hardware berbeda punya perbedaan fisik.
2. **Observasi UART** — pesan boot terlihat (U-Boot); input serial diarahkan ke `nulldev`, jadi output boot ≠ akses command line.
3. **Firmware extraction** — image eMMC lewat test point PCB untuk analisis offline.
4. **Firmware RE** — FIT image, U-Boot termodifikasi, ECC, partisi; format penyimpanan tidak sepenuhnya standar.
5. **Arsitektur** — SoC Catson, empat core Cortex-A53 (kontrol, lower-MAC RX/TX, PHY/utility). Root shell dilaporkan di literatur 2021, tanpa detail lengkap cara memperolehnya.

### 3. Checkpoint — 2025: UART dinonaktifkan lewat firmware

- Mitigasi SpaceX: update firmware memakai mekanisme berbasis **eFuse** untuk mematikan output UART pada perangkat terdampak.
- Dampak riset: observabilitas boot turun; fault injection yang mengandalkan UART sebagai sinyal observasi jadi lebih sulit. Itu bukan bukti Secure Boot sudah diperbaiki.
- Metode yang tetap relevan: firmware offline, dokumentasi hardware, emulasi. Laporan sekunder menyebut ekstraksi firmware Rev3 via eMMC (DARKNAVY).

### 4. Checkpoint — Target: Starlink Standard Actuated

| Fase | Status catatan | Ringkas |
| --- | --- | --- |
| 1 Hardware reconnaissance | Dilaporkan | Beli + teardown Standard Actuated, peta komponen |
| 2 Firmware acquisition | Dilaporkan | Baca eMMC untuk image offline |
| 3 Firmware RE | Sebagian | Emulasi layanan (httpdWebSocket, gRPC) via QEMU |
| 4 Hardware security breakthrough | Klaim belum terverifikasi | Klaim akses administratif penuh di literatur; jalur eksploitasi publik belum jelas |

## Progress

- Research objective SpaceX ACE tercatat di Fornix
- Checkpoint historis 2021–2022 (teardown → UART → eMMC → RE) tercatat
- Checkpoint mitigasi UART/eFuse 2025 tercatat
- Checkpoint target Standard Actuated (fase 1–4) tercatat
- Verifikasi lab mandiri terhadap klaim ACE / bypass Secure Boot belum
- Progress research di workspace: 0% (checkpoint masih Draft)

## Status

- **DONE** — framing objective; dokumentasi checkpoint literatur + target Standard Actuated di Fornix
- **IN PROGRESS** — riset ACE pada Starlink User Terminal (Secure Boot / hardware lock)
- **NOT STARTED / UNVERIFIED** — reproduksi lab bypass Secure Boot; verifikasi klaim akses administratif penuh

## Blocker

- Klaim breakthrough hardware security belum punya jalur publik yang bisa diverifikasi
- UART pada perangkat terdampak mitigasi eFuse mengurangi sinyal observasi boot
- Belum ada bukti lab lokal bahwa Secure Boot sudah dilewati pada unit yang dimiliki

## Next Action — SpaceX ACE

1. Pastikan generasi/revisi terminal lab (Standard Actuated vs revisi lain) tercatat sebelum eksperimen.
2. Prioritaskan jalur offline: image eMMC + RE, bukan mengandalkan console UART.
3. Pisahkan klaim literatur vs hasil yang bisa direproduksi di unit lab owned.
4. Untuk fase emulasi: lanjutkan pemetaan layanan firmware (httpdWebSocket / gRPC) di QEMU jika image sudah ada.
5. Jangan anggap klaim “full admin” selesai sampai ada bukti pada perangkat lab.

## Eskalasi / Need

- Tidak ada eskalasi (unit lab owned)
- Perlu konfirmasi revisi hardware terminal yang dipakai di lab
- Perlu image firmware / akses eMMC unit lab bila belum diambil
- Perlu sumber primer untuk klaim breakthrough yang masih “belum terverifikasi”
