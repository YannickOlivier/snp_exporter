# snp_exporter
Prometheus exporter for Imagine SNP (Selenio Network Processor) - IP Processor (SMPTE ST-2110) written in Node.js.

On a HTTP `/metrics` request, the exporter will query the Imagine SNP's API for data which it then aggregates and exposes as Prometheus metrics. 

Default port: 9688


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

`http://localhost:8080/metrics?instance=10.10.10.1&port=9089`

Will return (short portion of prometheus metrics)

````
# HELP snp_system_status_qsfp_primary_rx_power_1 snp_system_status_qsfp_primary_rx_power_1 of the System
# TYPE snp_system_status_qsfp_primary_rx_power_1 gauge
snp_system_status_qsfp_primary_rx_power_1{unit="dBm",app="snp_exporter"} -1

# HELP snp_system_status_qsfp_primary_tx_power_1 snp_system_status_qsfp_primary_tx_power_1 of the System
# TYPE snp_system_status_qsfp_primary_tx_power_1 gauge
snp_system_status_qsfp_primary_tx_power_1{unit="dBm",app="snp_exporter"} -1

# HELP snp_system_status_qsfp_secondary_rx_power_1 snp_system_status_qsfp_secondary_rx_power_1 of the System
# TYPE snp_system_status_qsfp_secondary_rx_power_1 gauge
snp_system_status_qsfp_secondary_rx_power_1{unit="dBm",app="snp_exporter"} -120

# HELP snp_system_status_qsfp_secondary_tx_power_1 snp_system_status_qsfp_secondary_tx_power_1 of the System
# TYPE snp_system_status_qsfp_secondary_tx_power_1 gauge
snp_system_status_qsfp_secondary_tx_power_1{unit="dBm",app="snp_exporter"} -120
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