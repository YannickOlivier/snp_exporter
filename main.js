const express = require('express');
const axios = require('axios');
const Prometheus = require('prom-client');
const register = new Prometheus.Registry();
const client = require('prom-client');
const moment = require('moment'); 


process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const server = express();

register.setDefaultLabels({
	app: 'snp_exporter'
})

// Crate custom metrics for SNP
const ptpStatusAll = new client.Gauge({
    name: "snp_ptp_status_all",
    help: "snp_ptp_status_all of the PTP client",
		labelNames: ['clockIdentity', 'ptpCtlrState', 'ptpMasterIP', 'ptpMasterInterfaceIP', 'ptpMasterPresent', 'ptpMasterUUID', 'ptpUcipIsMaster']
});
register.registerMetric(ptpStatusAll);

const ptpStatusUtc = new client.Gauge({
	name: "snp_ptp_status_utc",
	help: "snp_ptp_status_utc Value of the UTC Time",
	labelNames: ['unit']
});
register.registerMetric(ptpStatusUtc);

const ptpStatusBiggestSysTimeUpdate = new client.Gauge({
	name: "snp_ptp_status_biggest_sys_time_update",
	help: "snp_ptp_status_biggest_sys_time_update Value of the Bigget System Time Update",
	labelNames: ['unit']
});
register.registerMetric(ptpStatusBiggestSysTimeUpdate);

const ptpStatusNumSysTimeUpdates = new client.Gauge({
	name: "snp_ptp_status_num_sys_time_update",
	help: "snp_ptp_status_num_sys_time_update Value of the number of System Time Update",
});
register.registerMetric(ptpStatusNumSysTimeUpdates);

const ptpStatusMasterDelay = new client.Gauge({
	name: "snp_ptp_status_master_delay",
	help: "snp_ptp_status_master_delay Value of the Master Delay",
	labelNames: ['unit']
});
register.registerMetric(ptpStatusMasterDelay);

const ptpStatusMasterOffset = new client.Gauge({
	name: "snp_ptp_status_master_offset",
	help: "snp_ptp_status_master_offset Value of the Master Offset",
	labelNames: ['unit']
});
register.registerMetric(ptpStatusMasterOffset);

const wanStatusAll = new client.Gauge({
	name: "snp_wan_status_all",
	help: "snp_wan_status_all of the Wan",
	labelNames: ['priDns', 'altDns', 'dhcpInfo', 'hostname', 'registrationServer', 'registrationServerConnected', 'systemServer']
});
register.registerMetric(wanStatusAll);

const wanStatusPrimary = new client.Gauge({
	name: "snp_wan_status_primary",
	help: "snp_wan_status_primary of the Wan",
	labelNames: ['priEthMACaddr', 'priGateway', 'priIpAddr', 'priIpMask', 'priPortInfo', 'priSwitchInfo']
});
register.registerMetric(wanStatusPrimary);

const wanStatusPrimaryRxErrs = new client.Gauge({
	name: "snp_wan_status_primary_rx_errs",
	help: "snp_wan_status_primary_rx_errs of the Wan",
});
register.registerMetric(wanStatusPrimaryRxErrs);

const wanStatusPrimaryRxOverBandwidth = new client.Gauge({
	name: "snp_wan_status_primary_rx_overbandwidth",
	help: "snp_wan_status_primary_rx_overbandwidth of the Wan",
});
register.registerMetric(wanStatusPrimaryRxOverBandwidth);

const wanStatusPrimaryRxPkts = new client.Gauge({
	name: "snp_wan_status_primary_rx_packets",
	help: "snp_wan_status_primary_rx_packets of the Wan",
});
register.registerMetric(wanStatusPrimaryRxPkts);

const wanStatusPrimaryRxRate = new client.Gauge({
	name: "snp_wan_status_primary_rx_rate",
	help: "snp_wan_status_primary_rx_rate of the Wan",
	labelNames: ['unit']
});
register.registerMetric(wanStatusPrimaryRxRate);

const wanStatusPrimaryTxPkts = new client.Gauge({
	name: "snp_wan_status_primary_tx_packets",
	help: "snp_wan_status_primary_tx_packets of the Wan",
});
register.registerMetric(wanStatusPrimaryTxPkts);

const wanStatusPrimaryTxRate = new client.Gauge({
	name: "snp_wan_status_primary_tx_rate",
	help: "snp_wan_status_primary_tx_rate of the Wan",
	labelNames: ['unit']
});
register.registerMetric(wanStatusPrimaryTxRate);

const wanStatusSecondary = new client.Gauge({
	name: "snp_wan_status_secondary",
	help: "snp_wan_status_secondary of the Wan",
	labelNames: ['secEthMACaddr', 'secGateway', 'secIpAddr', 'secIpMask', 'secPortInfo', 'secSwitchInfo']
});
register.registerMetric(wanStatusSecondary);

const wanStatusSecondaryRxErrs = new client.Gauge({
	name: "snp_wan_status_secondary_rx_errs",
	help: "snp_wan_status_secondary_rx_errs of the Wan",
});
register.registerMetric(wanStatusPrimaryRxErrs);

const wanStatusSecondaryRxOverBandwidth = new client.Gauge({
	name: "snp_wan_status_secondary_rx_overbandwidth",
	help: "snp_wan_status_secondary_rx_overbandwidth of the Wan",
});
register.registerMetric(wanStatusSecondaryRxOverBandwidth);

const wanStatusSecondaryRxPkts = new client.Gauge({
	name: "snp_wan_status_secondary_rx_packets",
	help: "snp_wan_status_secondary_rx_packets of the Wan",
});
register.registerMetric(wanStatusSecondaryRxPkts);

const wanStatusSecondaryRxRate = new client.Gauge({
	name: "snp_wan_status_secondary_rx_rate",
	help: "snp_wan_status_secondary_rx_rate of the Wan",
	labelNames: ['unit']
});
register.registerMetric(wanStatusSecondaryRxRate);

const wanStatusSecondaryTxPkts = new client.Gauge({
	name: "snp_wan_status_secondary_tx_packets",
	help: "snp_wan_status_secondary_tx_packets of the Wan",
});
register.registerMetric(wanStatusSecondaryTxPkts);

const wanStatusSecondaryTxRate = new client.Gauge({
	name: "snp_wan_status_secondary_tx_rate",
	help: "snp_wan_status_secondary_tx_rate of the Wan",
	labelNames: ['unit']
});
register.registerMetric(wanStatusSecondaryTxRate);

const wanStatusRxConfigBw100G = new client.Gauge({
	name: "snp_wan_status_rx_config_bw_100G",
	help: "snp_wan_status_rx_config_bw_100G of the Wan",
	labelNames: ['unit']
});
register.registerMetric(wanStatusRxConfigBw100G);

const wanStatusRxConfigBw25GA = new client.Gauge({
	name: "snp_wan_status_rx_config_bw_25G_A",
	help: "snp_wan_status_rx_config_bw_25G_A of the Wan",
});
register.registerMetric(wanStatusRxConfigBw25GA);

const wanStatusRxConfigBw25GB = new client.Gauge({
	name: "snp_wan_status_rx_config_bw_25G_B",
	help: "snp_wan_status_rx_config_bw_25G_B of the Wan",
});
register.registerMetric(wanStatusRxConfigBw25GB);

const wanStatusRxConfigBw25GC = new client.Gauge({
	name: "snp_wan_status_rx_config_bw_25G_C",
	help: "snp_wan_status_rx_config_bw_25G_C of the Wan",
});
register.registerMetric(wanStatusRxConfigBw25GC);

const wanStatusRxConfigBw25GD = new client.Gauge({
	name: "snp_wan_status_rx_config_bw_25G_D",
	help: "snp_wan_status_rx_config_bw_25G_D of the Wan",
});
register.registerMetric(wanStatusRxConfigBw25GD);

const wanStatusTxConfigBw100G = new client.Gauge({
	name: "snp_wan_status_tx_config_bw_100G",
	help: "snp_wan_status_tx_config_bw_100G of the Wan",
	labelNames: ['unit']
});
register.registerMetric(wanStatusTxConfigBw100G);

const wanStatusTxConfigBw25GA = new client.Gauge({
	name: "snp_wan_status_tx_config_bw_25G_A",
	help: "snp_wan_status_tx_config_bw_25G_A of the Wan",
});
register.registerMetric(wanStatusTxConfigBw25GA);

const wanStatusTxConfigBw25GB = new client.Gauge({
	name: "snp_wan_status_tx_config_bw_25G_B",
	help: "snp_wan_status_tx_config_bw_25G_B of the Wan",
});
register.registerMetric(wanStatusTxConfigBw25GB);

const wanStatusTxConfigBw25GC = new client.Gauge({
	name: "snp_wan_status_tx_config_bw_25G_C",
	help: "snp_wan_status_tx_config_bw_25G_C of the Wan",
});
register.registerMetric(wanStatusTxConfigBw25GC);

const wanStatusTxConfigBw25GD = new client.Gauge({
	name: "snp_wan_status_tx_config_bw_25G_D",
	help: "snp_wan_status_tx_config_bw_25G_D of the Wan",
});
register.registerMetric(wanStatusTxConfigBw25GD);

const systemStatusHw = new client.Gauge({
	name: "snp_system_status_hw",
	help: "snp_system_status_hw of the System",
	labelNames: ['mac0', 'mac1', 'serial', 'fwRev', 'hwRev']
});
register.registerMetric(systemStatusHw);

const systemStatusAlarmStatsUniqueTypes = new client.Gauge({
	name: "snp_system_status_alarm_stat_unique_types",
	help: "snp_system_status_alarm_stat_unique_types of the Wan",
});
register.registerMetric(systemStatusAlarmStatsUniqueTypes);

const systemStatusAlarmStatsMinorInstances = new client.Gauge({
	name: "snp_system_status_alarm_stat_minor_instances",
	help: "snp_system_status_alarm_stat_minor_instances of the Wan",
});
register.registerMetric(systemStatusAlarmStatsMinorInstances);

const systemStatusAlarmStatsMajorInstances = new client.Gauge({
	name: "snp_system_status_alarm_stat_major_instances",
	help: "snp_system_status_alarm_stat_major_instances of the Wan",
});
register.registerMetric(systemStatusAlarmStatsMajorInstances);

const systemStatusFpgaHw1 = new client.Gauge({
	name: "snp_system_status_fpga_hw_1",
	help: "snp_system_status_fpga_hw_1 of the System",
	labelNames: ['tempAlarm', 'fanAlarm']
});
register.registerMetric(systemStatusFpgaHw1);

const systemStatusFpgaHw1Temp = new client.Gauge({
	name: "snp_system_status_fpga_hw_1_temp",
	help: "snp_system_status_fpga_hw_1_temp of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusFpgaHw1Temp);

const systemStatusFpgaHw2 = new client.Gauge({
	name: "snp_system_status_fpga_hw_2",
	help: "snp_system_status_fpga_hw_2 of the System",
	labelNames: ['tempAlarm', 'fanAlarm']
});
register.registerMetric(systemStatusFpgaHw2);

const systemStatusFpgaHw2Temp = new client.Gauge({
	name: "snp_system_status_fpga_hw_2_temp",
	help: "snp_system_status_fpga_hw_2_temp of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusFpgaHw2Temp);

const systemStatusFpgaHw3 = new client.Gauge({
	name: "snp_system_status_fpga_hw_3",
	help: "snp_system_status_fpga_hw_3 of the System",
	labelNames: ['tempAlarm', 'fanAlarm']
});
register.registerMetric(systemStatusFpgaHw3);

const systemStatusFpgaHw3Temp = new client.Gauge({
	name: "snp_system_status_fpga_hw_3_temp",
	help: "snp_system_status_fpga_hw_3_temp of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusFpgaHw3Temp);

const systemStatusFpgaHw4 = new client.Gauge({
	name: "snp_system_status_fpga_hw_4",
	help: "snp_system_status_fpga_hw_4 of the System",
	labelNames: ['tempAlarm', 'fanAlarm']
});
register.registerMetric(systemStatusFpgaHw4);

const systemStatusFpgaHw4Temp = new client.Gauge({
	name: "snp_system_status_fpga_hw_4_temp",
	help: "snp_system_status_fpga_hw_4_temp of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusFpgaHw4Temp);

const systemStatusFpgaHw5 = new client.Gauge({
	name: "snp_system_status_fpga_hw_5",
	help: "snp_system_status_fpga_hw_5 of the System",
	labelNames: ['tempAlarm', 'fanAlarm']
});
register.registerMetric(systemStatusFpgaHw5);

const systemStatusFpgaHw5Temp = new client.Gauge({
	name: "snp_system_status_fpga_hw_5_temp",
	help: "snp_system_status_fpga_hw_5_temp of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusFpgaHw5Temp);

const systemStatusPsHw1 = new client.Gauge({
	name: "snp_system_status_ps_hw_1",
	help: "snp_system_status_ps_hw_1 of the System",
});
register.registerMetric(systemStatusPsHw1);

const systemStatusPsHw2 = new client.Gauge({
	name: "snp_system_status_ps_hw_2",
	help: "snp_system_status_ps_hw_2 of the System",
});
register.registerMetric(systemStatusPsHw1);

const systemStatusQSFPPrimaryPresent = new client.Gauge({
	name: "snp_system_status_qsfp_primary_present",
	help: "snp_system_status_qsfp_primary_present of the System",
});
register.registerMetric(systemStatusQSFPPrimaryPresent);
const systemStatusQSFPSecondaryPresent = new client.Gauge({
	name: "snp_system_status_qsfp_secondary_present",
	help: "snp_system_status_qsfp_secondary_present of the System",
});
register.registerMetric(systemStatusQSFPSecondaryPresent);

const systemStatusQSFPPrimaryDataValid = new client.Gauge({
	name: "snp_system_status_qsfp_primary_dataValid",
	help: "snp_system_status_qsfp_primary_dataValid of the System",
});
register.registerMetric(systemStatusQSFPPrimaryDataValid);
const systemStatusQSFPSecondaryDataValid = new client.Gauge({
	name: "snp_system_status_qsfp_secondary_dataValid",
	help: "snp_system_status_qsfp_secondary_dataValid of the System",
});
register.registerMetric(systemStatusQSFPSecondaryDataValid);

const systemStatusQSFPPrimaryRxPower1 = new client.Gauge({
	name: "snp_system_status_qsfp_primary_rx_power_1",
	help: "snp_system_status_qsfp_primary_rx_power_1 of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusQSFPPrimaryRxPower1);
const systemStatusQSFPPrimaryTxPower1 = new client.Gauge({
	name: "snp_system_status_qsfp_primary_tx_power_1",
	help: "snp_system_status_qsfp_primary_tx_power_1 of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusQSFPPrimaryTxPower1);
const systemStatusQSFPSecondaryRxPower1 = new client.Gauge({
	name: "snp_system_status_qsfp_secondary_rx_power_1",
	help: "snp_system_status_qsfp_secondary_rx_power_1 of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusQSFPSecondaryRxPower1);
const systemStatusQSFPSecondaryTxPower1 = new client.Gauge({
	name: "snp_system_status_qsfp_secondary_tx_power_1",
	help: "snp_system_status_qsfp_secondary_tx_power_1 of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusQSFPSecondaryTxPower1);

const systemStatusQSFPPrimaryRxPower2 = new client.Gauge({
	name: "snp_system_status_qsfp_primary_rx_power_2",
	help: "snp_system_status_qsfp_primary_rx_power_2 of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusQSFPPrimaryRxPower2);
const systemStatusQSFPPrimaryTxPower2 = new client.Gauge({
	name: "snp_system_status_qsfp_primary_tx_power_2",
	help: "snp_system_status_qsfp_primary_tx_power_2 of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusQSFPPrimaryTxPower2);
const systemStatusQSFPSecondaryRxPower2 = new client.Gauge({
	name: "snp_system_status_qsfp_secondary_rx_power_2",
	help: "snp_system_status_qsfp_secondary_rx_power_2 of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusQSFPSecondaryRxPower2);
const systemStatusQSFPSecondaryTxPower2 = new client.Gauge({
	name: "snp_system_status_qsfp_secondary_tx_power_2",
	help: "snp_system_status_qsfp_secondary_tx_power_2 of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusQSFPSecondaryTxPower2);

const systemStatusQSFPPrimaryRxPower3 = new client.Gauge({
	name: "snp_system_status_qsfp_primary_rx_power_3",
	help: "snp_system_status_qsfp_primary_rx_power_3 of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusQSFPPrimaryRxPower3);
const systemStatusQSFPPrimaryTxPower3 = new client.Gauge({
	name: "snp_system_status_qsfp_primary_tx_power_3",
	help: "snp_system_status_qsfp_primary_tx_power_3 of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusQSFPPrimaryTxPower3);
const systemStatusQSFPSecondaryRxPower3 = new client.Gauge({
	name: "snp_system_status_qsfp_secondary_rx_power_3",
	help: "snp_system_status_qsfp_secondary_rx_power_3 of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusQSFPSecondaryRxPower3);
const systemStatusQSFPSecondaryTxPower3 = new client.Gauge({
	name: "snp_system_status_qsfp_secondary_tx_power_3",
	help: "snp_system_status_qsfp_secondary_tx_power_3 of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusQSFPPrimaryTxPower3);

const systemStatusQSFPPrimaryRxPower4 = new client.Gauge({
	name: "snp_system_status_qsfp_primary_rx_power_4",
	help: "snp_system_status_qsfp_primary_rx_power_4 of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusQSFPPrimaryRxPower4);
const systemStatusQSFPPrimaryTxPower4 = new client.Gauge({
	name: "snp_system_status_qsfp_primary_tx_power_4",
	help: "snp_system_status_qsfp_primary_tx_power_4 of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusQSFPPrimaryTxPower4);
const systemStatusQSFPSecondaryRxPower4 = new client.Gauge({
	name: "snp_system_status_qsfp_secondary_rx_power_4",
	help: "snp_system_status_qsfp_secondary_rx_power_4 of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusQSFPSecondaryRxPower4);
const systemStatusQSFPSecondaryTxPower4 = new client.Gauge({
	name: "snp_system_status_qsfp_secondary_tx_power_4",
	help: "snp_system_status_qsfp_secondary_tx_power_4 of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusQSFPSecondaryTxPower4);


const systemStatusBoardTemperaturesMain = new client.Gauge({
	name: "snp_system_status_board_temperatures_main",
	help: "snp_system_status_board_temperatures_main of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusBoardTemperaturesMain);

const systemStatusBoardTemperaturesIo = new client.Gauge({
	name: "snp_system_status_board_temperatures_io",
	help: "snp_system_status_board_temperatures_io of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusBoardTemperaturesIo);

const systemStatusFrontFan1 = new client.Gauge({
	name: "snp_system_status_fan_1",
	help: "snp_system_status_fan_1 of the System",
});
register.registerMetric(systemStatusFrontFan1);
const systemStatusFrontFanSpeed1 = new client.Gauge({
	name: "snp_system_status_fan_speed_1",
	help: "snp_system_status_fan_speed_1 of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusFrontFanSpeed1);

const systemStatusFrontFan2 = new client.Gauge({
	name: "snp_system_status_fan_2",
	help: "snp_system_status_fan_2 of the System",
});
register.registerMetric(systemStatusFrontFan2);
const systemStatusFrontFanSpeed2 = new client.Gauge({
	name: "snp_system_status_fan_speed_2",
	help: "snp_system_status_fan_speed_2 of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusFrontFanSpeed2);

const systemStatusFrontFan3 = new client.Gauge({
	name: "snp_system_status_fan_3",
	help: "snp_system_status_fan_3 of the System",
});
register.registerMetric(systemStatusFrontFan3);
const systemStatusFrontFanSpeed3 = new client.Gauge({
	name: "snp_system_status_fan_speed_3",
	help: "snp_system_status_fan_speed_3 of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusFrontFanSpeed3);

const systemStatusFrontFan4 = new client.Gauge({
	name: "snp_system_status_fan_4",
	help: "snp_system_status_fan_4 of the System",
});
register.registerMetric(systemStatusFrontFan4);
const systemStatusFrontFanSpeed4 = new client.Gauge({
	name: "snp_system_status_fan_speed_4",
	help: "snp_system_status_fan_speed_4 of the System",
	labelNames: ['unit']
});
register.registerMetric(systemStatusFrontFanSpeed4);

// Express server 
server.get('/metrics', async (req, res) =>
{
    res.setHeader('Content-Type',register.contentType)
		const urlSnp = req.query.instance; 
		const portSnp = req.query.port; 
		var ptp = await snpGetStatusPtp(urlSnp, portSnp);
		var wan = await snpGetStatusWan(urlSnp, portSnp);
		var system = await snpGetStatusSystem(urlSnp, portSnp);
    register.metrics().then(data => res.status(200).send(data))
		register.resetMetrics()
});

console.log('process.env.USERNAME', process.env.USERNAME);

// Async function to get Token
async function snpGetToken(snpUrl, snpPort) {
  try {
    const res = await axios({
      method: 'post',
      url: `https://${snpUrl}:${snpPort}/api/auth`,
      headers: { "Content-Type": "application/json" },
      data: {
        "username": process.env.USERNAME_SNP || "admin",
        "password": process.env.PASSWORD_SNP || "password"
      }
    });
    console.log(`snpGetToken [INFO] - ${snpUrl} - ${res.status}`);
    return res.data;
  } catch (err) {
    console.log(`snpGetToken [ERROR] - ${snpUrl} - ${err}`);
  }
}

// Async function to get PTP Status
async function snpGetStatusPtp(snpUrl, snpPort) {
  try {
    const token = await snpGetToken(snpUrl, snpPort);
    const res = await axios({
      method: 'get',
      url: `https://${snpUrl}:${snpPort}/api/elements/${snpUrl}/status/ptp`,
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
      },
    });

		const ptp = res.data.ptpStatus;
		
		ptpStatusAll.labels({
			clockIdentity: ptp.clockIdentity,
			ptpCtlrState: ptp.ptpCtlrState,
			ptpMasterIP: ptp.ptpMasterIP,
			ptpMasterInterfaceIP: ptp.ptpMasterInterfaceIP,
			ptpMasterPresent: ptp.ptpMasterPresent,
			ptpMasterUUID: ptp.ptpMasterUUID,
			ptpUcipIsMaster: ptp.ptpUcipIsMaster
		}).set(1);

		ptpStatusUtc.labels({
			unit: 'ms',
		}).set(moment(moment(ptp.ptpUTC, ["MM-DD-YYYY", "YYYY-MM-DD"]).format()).unix()*1000);

		ptpStatusBiggestSysTimeUpdate.labels({
			unit: ptp.biggestSysTimeUpdate.split(' ')[1],
		}).set(parseFloat(ptp.biggestSysTimeUpdate.split(' ')[0]));

		ptpStatusNumSysTimeUpdates.set(parseFloat(ptp.numSysTimeUpdates.split(' ')[0]));

		ptpStatusMasterDelay.labels({
			unit: ptp.ptpMasterDelay.split(' ')[1],
		}).set(parseFloat(ptp.ptpMasterDelay.split(' ')[0]));

		ptpStatusMasterOffset.labels({
			unit: ptp.ptpMasterOffset.split(' ')[1],
		}).set(parseFloat(ptp.ptpMasterOffset.split(' ')[0]));
		console.log(`snpGetStatusPtp [INFO] - ${snpUrl} - ${res.status}`);
    return res;
  } catch (err) {
    console.log(`snpGetStatusPtp [ERROR] - ${snpUrl} - ${err}`);
  }
}

// Async function to get Wan Status
async function snpGetStatusWan(snpUrl, snpPort) {
  try {
    const token = await snpGetToken(snpUrl, snpPort);
    const res = await axios({
      method: 'get',
      url: `https://${snpUrl}:${snpPort}/api/elements/${snpUrl}/status/ipWan`,
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
      },
    });

		const wan = res.data.ipWanStatus;
		
		wanStatusAll.labels({
			priDns: wan.priDns,
			altDns: wan.altDns,
			dhcpInfo: wan.dhcpInfo,
			hostname: wan.hostName,
			registrationServer: wan.registrationServer,
			registrationServerConnected: wan.registrationServerConnected,
			systemServer: wan.systemServer
		}).set(1);
		
		// primary
		wanStatusPrimary.labels({
			priEthMACaddr: wan.priEthMACaddr,
			priGateway: wan.priGateway,
			priIpAddr: wan.priIpAddr,
			priIpMask: wan.priIpMask,
			priPortInfo: wan.priPortInfo,
			priSwitchInfo: wan.priSwitchInfo,
		}).set(1);
		wanStatusSecondary.labels({
			secEthMACaddr: wan.secEthMACaddr,
			secGateway: wan.secGateway,
			secIpAddr: wan.secIpAddr,
			secIpMask: wan.secIpMask,
			secPortInfo: wan.secPortInfo,
			secSwitchInfo: wan.secSwitchInfo,
		}).set(1);

		wanStatusPrimaryRxErrs.set(parseFloat(wan.priRxErrs));
		wanStatusSecondaryRxErrs.set(parseFloat(wan.secRxErrs));

		wanStatusPrimaryRxOverBandwidth.set(Number(wan.priRxOverBandwidth));
		wanStatusSecondaryRxOverBandwidth.set(Number(wan.secRxOverBandwidth));

		wanStatusPrimaryRxPkts.set(parseFloat(wan.priRxPkts));
		wanStatusSecondaryRxPkts.set(parseFloat(wan.secRxPkts));

		wanStatusPrimaryRxRate.labels({
			unit: wan.priRxRate.split(' ')[1],
		}).set(parseFloat(wan.priRxRate.split(' ')[0]));
		wanStatusSecondaryRxRate.labels({
			unit: wan.secRxRate.split(' ')[1],
		}).set(parseFloat(wan.secRxRate.split(' ')[0]));

		wanStatusPrimaryTxPkts.set(parseFloat(wan.priTxPkts));
		wanStatusSecondaryTxPkts.set(parseFloat(wan.secTxPkts));

		wanStatusPrimaryTxRate.labels({
			unit: wan.priTxRate.split(' ')[1],
		}).set(parseFloat(wan.priTxRate.split(' ')[0]));
		wanStatusSecondaryTxRate.labels({
			unit: wan.secTxRate.split(' ')[1],
		}).set(parseFloat(wan.secTxRate.split(' ')[0]));

		wanStatusRxConfigBw100G.labels({
			unit: wan.rxConfigBw100G.split(' ')[1],
		}).set(parseFloat(wan.rxConfigBw100G.split(' ')[0]));
		wanStatusTxConfigBw100G.labels({
			unit: wan.txConfigBw100G.split(' ')[1],
		}).set(parseFloat(wan.txConfigBw100G.split(' ')[0]));

		wanStatusTxConfigBw25GA.set(parseFloat(wan.txConfigBw25G[0]));
		wanStatusRxConfigBw25GA.set(parseFloat(wan.rxConfigBw25G[0]));

		wanStatusTxConfigBw25GB.set(parseFloat(wan.txConfigBw25G[1]));
		wanStatusRxConfigBw25GB.set(parseFloat(wan.rxConfigBw25G[1]));

		wanStatusTxConfigBw25GC.set(parseFloat(wan.txConfigBw25G[2]));
		wanStatusRxConfigBw25GC.set(parseFloat(wan.rxConfigBw25G[2]));

		wanStatusTxConfigBw25GD.set(parseFloat(wan.txConfigBw25G[3]));
		wanStatusRxConfigBw25GD.set(parseFloat(wan.rxConfigBw25G[3]));
		
		console.log(`snpGetStatusWan [INFO] - ${snpUrl} - ${res.status}`);
    return res;
  } catch (err) {
    console.log(`snpGetStatusWan [ERROR] - ${snpUrl} - ${err}`);
  }
}

// Async function to get System Status
async function snpGetStatusSystem(snpUrl, snpPort) {
  try {
    const token = await snpGetToken(snpUrl, snpPort);
    const res = await axios({
      method: 'get',
      url: `https://${snpUrl}:${snpPort}/api/elements/${snpUrl}/status/system`,
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
      },
    });

		const system = res.data;
				 
		systemStatusHw.labels({
			mac0: system.SNP_HW_Stats.MAC_0,
			mac1: system.SNP_HW_Stats.MAC_1,
			serial: system.SNP_HW_Stats.Serial,
			fwRev: system.SNP_HW_Stats.FWRev,
			hwRev: system.SNP_HW_Stats.HWRev,
		}).set(1);

		systemStatusAlarmStatsUniqueTypes.set(system.Alarm_Stats.uniqueTypes);
		systemStatusAlarmStatsMinorInstances.set(system.Alarm_Stats.uniqueTypes);
		systemStatusAlarmStatsMajorInstances.set(system.Alarm_Stats.majorInstances);
		
		systemStatusFpgaHw1.labels({
			tempAlarm: Number(system.FPGA_HW_Stats[0].Temp_Alarm),
			fanAlarm: Number(system.FPGA_HW_Stats[0].Fan_Alarm),
		}).set(1);
		systemStatusFpgaHw1Temp.labels({
			unit: system.FPGA_HW_Stats[0].Temp.split(' ')[1],
		}).set(Number(system.FPGA_HW_Stats[0].Temp.split(' ')[0]));

		systemStatusFpgaHw2.labels({
			tempAlarm: Number(system.FPGA_HW_Stats[1].Temp_Alarm),
			fanAlarm: Number(system.FPGA_HW_Stats[1].Fan_Alarm),
		}).set(1);
		systemStatusFpgaHw2Temp.labels({
			unit: system.FPGA_HW_Stats[1].Temp.split(' ')[1],
		}).set(Number(system.FPGA_HW_Stats[1].Temp.split(' ')[0]));

		systemStatusFpgaHw3.labels({
			tempAlarm: Number(system.FPGA_HW_Stats[2].Temp_Alarm),
			fanAlarm: Number(system.FPGA_HW_Stats[2].Fan_Alarm),
		}).set(1);
		systemStatusFpgaHw3Temp.labels({
			unit: system.FPGA_HW_Stats[2].Temp.split(' ')[1],
		}).set(Number(system.FPGA_HW_Stats[2].Temp.split(' ')[0]));

		systemStatusFpgaHw4.labels({
			tempAlarm: Number(system.FPGA_HW_Stats[3].Temp_Alarm),
			fanAlarm: Number(system.FPGA_HW_Stats[3].Fan_Alarm),
		}).set(1);
		systemStatusFpgaHw4Temp.labels({
			unit: system.FPGA_HW_Stats[3].Temp.split(' ')[1],
		}).set(Number(system.FPGA_HW_Stats[3].Temp.split(' ')[0]));

		systemStatusFpgaHw5.labels({
			tempAlarm: Number(system.FPGA_HW_Stats[4].Temp_Alarm),
			fanAlarm: Number(system.FPGA_HW_Stats[4].Fan_Alarm),
		}).set(1);
		systemStatusFpgaHw5Temp.labels({
			unit: system.FPGA_HW_Stats[4].Temp.split(' ')[1],
		}).set(Number(system.FPGA_HW_Stats[4].Temp.split(' ')[0]));

		systemStatusPsHw1.set(Number(system.Power_Supply_Stats.PS_EN_1));
		systemStatusPsHw2.set(Number(system.Power_Supply_Stats.PS_EN_2));

		// Clean RX & TX with null data
		for (let i = 0; i < 2 ; i++) {
			for (let n = 1; n < 5 ; n++) {
				if (eval(`system.QSFP_Stats[${i}].TxPower${n}`) === ("N/A" || "---")) {
					eval(`system.QSFP_Stats[${i}].TxPower${n}="-120 dBm"`)
				}
				if (eval(`system.QSFP_Stats[${i}].RxPower${n}`) === ("N/A" || "---")) {
					eval(`system.QSFP_Stats[${i}].RxPower${n}="-120 dBm"`)
				}
			}
		}

		systemStatusQSFPPrimaryRxPower1.labels({
			unit: system.QSFP_Stats[0].RxPower1.split(' ')[1],
		}).set(Number(system.QSFP_Stats[0].RxPower1.split(' ')[0]));
		systemStatusQSFPPrimaryTxPower1.labels({
			unit: system.QSFP_Stats[0].TxPower1.split(' ')[1],
		}).set(Number(system.QSFP_Stats[0].TxPower1.split(' ')[0]));

		systemStatusQSFPSecondaryRxPower1.labels({
			unit: system.QSFP_Stats[1].RxPower1.split(' ')[1],
		}).set(Number(system.QSFP_Stats[1].RxPower1.split(' ')[0]));
		systemStatusQSFPSecondaryTxPower1.labels({
			unit: system.QSFP_Stats[1].TxPower1.split(' ')[1],
		}).set(Number(system.QSFP_Stats[1].TxPower1.split(' ')[0]));

		systemStatusQSFPPrimaryRxPower2.labels({
			unit: system.QSFP_Stats[0].RxPower2.split(' ')[1],
		}).set(Number(system.QSFP_Stats[0].RxPower2.split(' ')[0]));
		systemStatusQSFPPrimaryTxPower2.labels({
			unit: system.QSFP_Stats[0].TxPower2.split(' ')[1],
		}).set(Number(system.QSFP_Stats[0].TxPower2.split(' ')[0]));

		systemStatusQSFPSecondaryRxPower2.labels({
			unit: system.QSFP_Stats[1].RxPower2.split(' ')[1],
		}).set(Number(system.QSFP_Stats[1].RxPower2.split(' ')[0]));
		systemStatusQSFPSecondaryTxPower2.labels({
			unit: system.QSFP_Stats[1].TxPower2.split(' ')[1],
		}).set(Number(system.QSFP_Stats[1].TxPower2.split(' ')[0]));

		systemStatusQSFPPrimaryRxPower3.labels({
			unit: system.QSFP_Stats[0].RxPower3.split(' ')[1],
		}).set(Number(system.QSFP_Stats[0].RxPower3.split(' ')[0]));
		systemStatusQSFPPrimaryTxPower3.labels({
			unit: system.QSFP_Stats[0].TxPower3.split(' ')[1],
		}).set(Number(system.QSFP_Stats[0].TxPower3.split(' ')[0]));

		systemStatusQSFPSecondaryRxPower3.labels({
			unit: system.QSFP_Stats[1].RxPower3.split(' ')[1],
		}).set(Number(system.QSFP_Stats[1].RxPower3.split(' ')[0]));
		systemStatusQSFPSecondaryTxPower3.labels({
			unit: system.QSFP_Stats[1].TxPower3.split(' ')[1],
		}).set(Number(system.QSFP_Stats[1].TxPower3.split(' ')[0]));

		systemStatusQSFPPrimaryRxPower4.labels({
			unit: system.QSFP_Stats[0].RxPower4.split(' ')[1],
		}).set(Number(system.QSFP_Stats[0].RxPower4.split(' ')[0]));
		systemStatusQSFPPrimaryTxPower4.labels({
			unit: system.QSFP_Stats[0].TxPower4.split(' ')[1],
		}).set(Number(system.QSFP_Stats[0].TxPower4.split(' ')[0]));

		systemStatusQSFPSecondaryRxPower4.labels({
			unit: system.QSFP_Stats[1].RxPower4.split(' ')[1],
		}).set(Number(system.QSFP_Stats[1].RxPower4.split(' ')[0]));
		systemStatusQSFPSecondaryTxPower4.labels({
			unit: system.QSFP_Stats[1].TxPower4.split(' ')[1],
		}).set(Number(system.QSFP_Stats[1].TxPower4.split(' ')[0]));	
		
		systemStatusBoardTemperaturesMain.labels({
			unit: system.Board_Temperatures.Main_Board.split(' ')[1],
		}).set(Number(system.Board_Temperatures.Main_Board.split(' ')[0]));
		systemStatusBoardTemperaturesIo.labels({
			unit: system.Board_Temperatures.IO_Board.split(' ')[1],
		}).set(Number(system.Board_Temperatures.IO_Board.split(' ')[0]));	

		systemStatusFrontFan1.set(Number(String(system.Front_Fan_Stats[0].Status) === "OK"));
		systemStatusFrontFanSpeed1.labels({
			unit: system.Front_Fan_Stats[0].RotationalSpeed.split(' ')[1],
		}).set(Number(system.Front_Fan_Stats[0].RotationalSpeed.split(' ')[0]));

		systemStatusFrontFan2.set(Number(String(system.Front_Fan_Stats[1].Status) === "OK"));
		systemStatusFrontFanSpeed2.labels({
			unit: system.Front_Fan_Stats[1].RotationalSpeed.split(' ')[1],
		}).set(Number(system.Front_Fan_Stats[1].RotationalSpeed.split(' ')[0]));

		systemStatusFrontFan3.set(Number(String(system.Front_Fan_Stats[2].Status) === "OK"));
		systemStatusFrontFanSpeed3.labels({
			unit: system.Front_Fan_Stats[2].RotationalSpeed.split(' ')[1],
		}).set(Number(system.Front_Fan_Stats[2].RotationalSpeed.split(' ')[0]));

		systemStatusFrontFan4.set(Number(String(system.Front_Fan_Stats[3].Status) === "OK"));
		systemStatusFrontFanSpeed4.labels({
			unit: system.Front_Fan_Stats[3].RotationalSpeed.split(' ')[1],
		}).set(Number(system.Front_Fan_Stats[3].RotationalSpeed.split(' ')[0]));

		console.log(`snpGetStatusSystem [INFO] - ${snpUrl} - ${res.status}`);
    return res;
  } catch (err) {
    console.log(`snpGetStatusSystem [ERROR] - ${snpUrl} - ${err}`);
  }
}

const port = process.env.PORT || 8080;
console.log(
	`SNP_exporter - Server listening to ${port}, metrics exposed on /metrics endpoint`,
);
server.listen(port);