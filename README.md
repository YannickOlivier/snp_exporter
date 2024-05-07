# snp_exporter
Prometheus exporter for Imagine SNP (Selenio Network Processor) - IP Processor (SMPTE ST-2110) written in Node.js.

On a HTTP `/metrics` request, the exporter will query the Imagine SNP's API for data which it then aggregates and exposes as Prometheus metrics. 


![Docker Pulls](https://img.shields.io/docker/pulls/yannick2110/snp_exporter?logo=Docker)
![Docker Image Version (latest)](https://img.shields.io/docker/v/yannick2110/snp_exporter?label=latest%20docker%20image&logo=Docker)
![GitHub](https://img.shields.io/github/license/yannickOlivier/snp_exporter)

Docker container image: [https://hub.docker.com/r/yannick2110/snp_exporter](https://hub.docker.com/r/yannick2110/snp_exporter)

## Documentation 

- This exporter will listen by default on the port `8080`
- Two arguments are needed :
  - `instance` with the SNP's URL
  - `port` with the SNP's API port (`9089` by default)
- Default API credentials are used if no environnment variables are provided (see *docker-compose* example)

## Exported metrics

| API            |  Metrics exported            |
|----------------|------------------------------|
| PTP Status     | Offset, Delay, GMC ID...     |
| Wan Status     | Primary and Secondary links  |
| System Status  | Hardware (PS, Fans, FPGA)    |

## snp_exporter example 

### Route - option 1
`http://localhost:8080/metrics?instance=10.10.10.1&port=9089`

### Route - option 2
`http://localhost:8080/metrics/10.10.10.10/9089`

Will return (short portion of prometheus metrics)

````
# HELP snp_ptp_status snp_ptp_status of the PTP client
# TYPE snp_ptp_status gauge
snp_ptp_status{component="utc_time",unit="ms",app="snp_exporter"} 1713259694000
snp_ptp_status{component="biggest_sys_time_update",unit="ms",app="snp_exporter"} 6573
snp_ptp_status{component="num_sys_time_update",app="snp_exporter"} 7
snp_ptp_status{component="ptp_master_delay",app="snp_exporter"} 0.883
snp_ptp_status{component="ptp_master_offset",app="snp_exporter"} 0.498

# HELP snp_wan_status snp_wan_status of the System
# TYPE snp_wan_status gauge
snp_wan_status{alarmType="wan_alarm",component="errs",network="primary",way="rx",app="snp_exporter"} 0
snp_wan_status{alarmType="wan_alarm",component="over_bandwidth",network="primary",way="rx",app="snp_exporter"} 0
snp_wan_status{alarmType="wan_alarm",component="pkts",network="primary",way="rx",app="snp_exporter"} 8094088
snp_wan_status{alarmType="wan_alarm",component="rate",network="primary",way="rx",unit="Mbps",app="snp_exporter"} 0.02
snp_wan_status{alarmType="wan_alarm",component="config_bw_100G",way="rx",unit="Mbps",app="snp_exporter"} 0
snp_wan_status{alarmType="wan_alarm",component="config_bw_25G_A",way="rx",app="snp_exporter"} 0
snp_wan_status{alarmType="wan_alarm",component="config_bw_25G_B",way="rx",app="snp_exporter"} 0
````

## docker-compose example 

````
version: '3'

services:
    app:
        image: yannick2110:snp_exporter
        container_name: snp_exporter
        restart: on-failure
        ports:
            - 8080:8080
        environment:
            USERNAME_SNP: "admin"        # Set Username
            PASSWORD_SNP: "password"     # Set Password
````