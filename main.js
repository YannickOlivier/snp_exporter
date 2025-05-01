const express = require('express');
const axios = require('axios');
const client = require('prom-client');
const moment = require('moment'); 
const { Mutex } = require('async-mutex');
const metricsMutex = new Mutex();

const register = new client.Registry();


process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const server = express();

register.setDefaultLabels({
	app: 'snp_exporter',
	hostname: ''
})

// Pull the SNP Processor Personalities
const snpProcA = new client.Gauge({
	name: "snp_processorA_personality",
	help: "snp_processorA_personality",
	labelNames: ['personality']
});
register.registerMetric(snpProcA);

const snpProcB = new client.Gauge({
	name: "snp_processorB_personality",
	help: "snp_processorB_personality",
	labelNames: ['personality']
});
register.registerMetric(snpProcB);

const snpProcC = new client.Gauge({
	name: "snp_processorC_personality",
	help: "snp_processorC_personality",
	labelNames: ['personality']
});
register.registerMetric(snpProcC);

const snpProcD = new client.Gauge({
	name: "snp_processorD_personality",
	help: "snp_processorD_personality",
	labelNames: ['personality']
});
register.registerMetric(snpProcD);

// Create custom metrics for SNP
const ptpStatusAll = new client.Gauge({
    name: "snp_ptp_status_all",
    help: "snp_ptp_status_all of the PTP client",
		labelNames: ['clockIdentity', 'ptpCtlrState', 'ptpMasterIP', 'ptpMasterInterfaceIP', 'ptpMasterPresent', 'ptpMasterUUID', 'ptpUcipIsMaster']
});
register.registerMetric(ptpStatusAll);

const ptpStatus = new client.Gauge({
	name: "snp_ptp_status",
	help: "snp_ptp_status of the PTP client",
	labelNames: ['unit', 'component']
});
register.registerMetric(ptpStatus);

const wanStatusAll = new client.Gauge({
	name: "snp_wan_status_all",
	help: "snp_wan_status_all of the Wan",
	labelNames: ['priDns', 'altDns', 'dhcpInfo', 'hostname', 'registrationServer', 'registrationServerConnected', 'systemServer']
});
register.registerMetric(wanStatusAll);

const wanStatus = new client.Gauge({
	name: "snp_wan_status",
	help: "snp_wan_status of the System",
	labelNames: ['component', 'network', 'alarmType', 'way', 'unit']
});
register.registerMetric(wanStatus);

const wanStatusPrimary = new client.Gauge({
	name: "snp_wan_status_primary",
	help: "snp_wan_status_primary of the Wan",
	labelNames: ['priEthMACaddr', 'priGateway', 'priIpAddr', 'priIpMask', 'priPortInfo', 'priSwitchInfo']
});
register.registerMetric(wanStatusPrimary);

const wanStatusSecondary = new client.Gauge({
	name: "snp_wan_status_secondary",
	help: "snp_wan_status_secondary of the Wan",
	labelNames: ['secEthMACaddr', 'secGateway', 'secIpAddr', 'secIpMask', 'secPortInfo', 'secSwitchInfo']
});
register.registerMetric(wanStatusSecondary);

const systemStatusHw = new client.Gauge({
	name: "snp_system_status_hw",
	help: "snp_system_status_hw of the System",
	labelNames: ['mac0', 'mac1', 'serial', 'fwRev', 'hwRev']
});
register.registerMetric(systemStatusHw);

const systemStatusHwAlarm = new client.Gauge({
	name: "snp_system_status_hw_alarm",
	help: "snp_system_status_hw_alarm of the System",
	labelNames: ['component', 'alarmType']
});
register.registerMetric(systemStatusHwAlarm);

const systemStatusHwTemp = new client.Gauge({
	name: "snp_system_status_hw_temp",
	help: "snp_system_status_hw_temp of the System",
	labelNames: ['component', 'alarmType', 'unit']
});
register.registerMetric(systemStatusHwTemp);

const systemStatusHwSpeed = new client.Gauge({
	name: "snp_system_status_hw_speed",
	help: "snp_system_status_hw_speed of the System",
	labelNames: ['component', 'unit']
});
register.registerMetric(systemStatusHwSpeed);

const systemStatusQSFP = new client.Gauge({
	name: "snp_system_status_qsfp",
	help: "snp_system_status_qsfp of the System",
	labelNames: ['component', 'network', 'alarmType', 'way', 'unit', 'vendor_name', 'vendor_pn', 'vendor_sn']
});
register.registerMetric(systemStatusQSFP);

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



// Express server - route 1
server.get('/metrics/:urlSnp/:portSnp', async (req, res) =>
{
    const release = await metricsMutex.acquire();
    try {
        res.setHeader('Content-Type', register.contentType);
        const urlSnp = req.params.urlSnp;
        const portSnp = req.params.portSnp;
        await snpGetStatusPtp(urlSnp, portSnp);
        await snpGetStatusWan(urlSnp, portSnp);
        await snpGetStatusSystem(urlSnp, portSnp);
        await snpGetStatusProcA(urlSnp, portSnp);
	      await snpGetStatusProcB(urlSnp, portSnp);
        await snpGetStatusProcC(urlSnp, portSnp);
        await snpGetStatusProcD(urlSnp, portSnp);
        const data = await register.metrics();
        res.status(200).send(data);
    } finally {
        register.resetMetrics();
        release();
    }
});

// Express server - route 2
server.get('/metrics', async (req, res) =>
{
    const release = await metricsMutex.acquire();
    try {
        res.setHeader('Content-Type', register.contentType);
        const urlSnp = req.query.instance;
        const portSnp = req.query.port;
        await snpGetStatusPtp(urlSnp, portSnp);
        await snpGetStatusWan(urlSnp, portSnp);
        await snpGetStatusSystem(urlSnp, portSnp);
        await snpGetStatusProcA(urlSnp, portSnp);
	      await snpGetStatusProcB(urlSnp, portSnp);
        await snpGetStatusProcC(urlSnp, portSnp);
        await snpGetStatusProcD(urlSnp, portSnp);
        const data = await register.metrics();
        res.status(200).send(data);
    } finally {
        register.resetMetrics();
        release();
    }
});

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
	
	// Async function to get Processor Personality A
	async function snpGetStatusProcA(snpUrl, snpPort) {
	try {
		console.log(`snpGetStatusProcA [INFO] - Requesting token for ${snpUrl}:${snpPort}`);
		const token = await snpGetToken(snpUrl, snpPort);  // Get authorization token
		console.log(`snpGetStatusProcA [INFO] - Token received: ${token}`);
	
		// Make the API request
		const res = await axios({
		method: 'get',
		url: `https://${snpUrl}:${snpPort}/api/elements/${snpUrl}/config/processorA`,
		headers: {
			"Content-Type": "application/json",
			"Authorization": token,  // Include authorization header
		},
		});
		
		console.log(`snpGetStatusProcA [INFO] - API Response Status: ${res.status}`);
		console.log(`snpGetStatusProcA [INFO] - API Response Data: ${JSON.stringify(res.data)}`);
	
		// Check if 'config' exists in res.data before parsing
		if (!res.data || !res.data.config) {
		console.log("snpGetStatusProcA [ERROR] - No config data found in the response");
		return;
		}
	
// Parse the config field (as it's a JSON string) in res.data
const proca = JSON.parse(res.data.config);
console.log(`snpGetStatusProcA [INFO] - Parsed proca: ${JSON.stringify(proca)}`);

// Check if 'general' and 'personality' exist in proca
if (proca.general && proca.general.personality) {
  console.log(`snpGetStatusProcA [INFO] - Personality: ${proca.general.personality}`);
  
  // Set the personality as a label in snpProcA metric
  snpProcA.labels({
    personality: proca.general.personality,  // Access 'personality' in the 'general' object
  }).set(1);  // Set the value of the metric to 1
} else {
  console.log("snpGetStatusProcA [ERROR] - Personality not found in the response");
}

console.log(`snpGetStatusProcA [INFO] - ${snpUrl} - ${res.status}`);  // Log successful response
return res;
} catch (err) {
  console.log(`snpGetStatusProcA [ERROR] - ${snpUrl} - ${err.message || err}`);
}

}

	// Async function to get Processor Personality B
	async function snpGetStatusProcB(snpUrl, snpPort) {
		try {
			console.log(`snpGetStatusProcB [INFO] - Requesting token for ${snpUrl}:${snpPort}`);
			const token = await snpGetToken(snpUrl, snpPort);  // Get authorization token
			console.log(`snpGetStatusProcB [INFO] - Token received: ${token}`);
		
			// Make the API request
			const res = await axios({
			method: 'get',
			url: `https://${snpUrl}:${snpPort}/api/elements/${snpUrl}/config/processorB`,
			headers: {
				"Content-Type": "application/json",
				"Authorization": token,  // Include authorization header
			},
			});
			
			console.log(`snpGetStatusProcB [INFO] - API Response Status: ${res.status}`);
			console.log(`snpGetStatusProcB [INFO] - API Response Data: ${JSON.stringify(res.data)}`);
		
			// Check if 'config' exists in res.data before parsing
			if (!res.data || !res.data.config) {
			console.log("snpGetStatusProcB [ERROR] - No config data found in the response");
			return;
			}
		
	// Parse the config field (as it's a JSON string) in res.data
	const procb = JSON.parse(res.data.config);
	console.log(`snpGetStatusProcB [INFO] - Parsed procb: ${JSON.stringify(procb)}`);
	
	// Check if 'general' and 'personality' exist in proca
	if (procb.general && procb.general.personality) {
	  console.log(`snpGetStatusProcB [INFO] - Personality: ${procb.general.personality}`);
	  
	  // Set the personality as a label in snpProcB metric
	  snpProcB.labels({
		personality: procb.general.personality,  // Access 'personality' in the 'general' object
	  }).set(1);  // Set the value of the metric to 1
	} else {
	  console.log("snpGetStatusProcB [ERROR] - Personality not found in the response");
	}
	
	console.log(`snpGetStatusProcB [INFO] - ${snpUrl} - ${res.status}`);  // Log successful response
	return res;
	} catch (err) {
	  console.log(`snpGetStatusProcB [ERROR] - ${snpUrl} - ${err.message || err}`);
	}
	
	}
	// Async function to get Processor Personality C
	async function snpGetStatusProcC(snpUrl, snpPort) {
		try {
			console.log(`snpGetStatusProcC [INFO] - Requesting token for ${snpUrl}:${snpPort}`);
			const token = await snpGetToken(snpUrl, snpPort);  // Get authorization token
			console.log(`snpGetStatusProcC [INFO] - Token received: ${token}`);
		
			// Make the API request
			const res = await axios({
			method: 'get',
			url: `https://${snpUrl}:${snpPort}/api/elements/${snpUrl}/config/processorC`,
			headers: {
				"Content-Type": "application/json",
				"Authorization": token,  // Include authorization header
			},
			});
			
			console.log(`snpGetStatusProcC [INFO] - API Response Status: ${res.status}`);
			console.log(`snpGetStatusProcC [INFO] - API Response Data: ${JSON.stringify(res.data)}`);
		
			// Check if 'config' exists in res.data before parsing
			if (!res.data || !res.data.config) {
			console.log("snpGetStatusProcC [ERROR] - No config data found in the response");
			return;
			}
		
	// Parse the config field (as it's a JSON string) in res.data
	const procc = JSON.parse(res.data.config);
	console.log(`snpGetStatusProcC [INFO] - Parsed procc: ${JSON.stringify(procc)}`);
	
	// Check if 'general' and 'personality' exist in proca
	if (procc.general && procc.general.personality) {
	  console.log(`snpGetStatusProcA [INFO] - Personality: ${procc.general.personality}`);
	  
	  // Set the personality as a label in snpProcC metric
	  snpProcC.labels({
		personality: procc.general.personality,  // Access 'personality' in the 'general' object
	  }).set(1);  // Set the value of the metric to 1
	} else {
	  console.log("snpGetStatusProcC [ERROR] - Personality not found in the response");
	}
	
	console.log(`snpGetStatusProcC [INFO] - ${snpUrl} - ${res.status}`);  // Log successful response
	return res;
	} catch (err) {
	  console.log(`snpGetStatusProcC [ERROR] - ${snpUrl} - ${err.message || err}`);
	}
	
	}

		// Async function to get Processor Personality D
		async function snpGetStatusProcD(snpUrl, snpPort) {
			try {
				console.log(`snpGetStatusProcD [INFO] - Requesting token for ${snpUrl}:${snpPort}`);
				const token = await snpGetToken(snpUrl, snpPort);  // Get authorization token
				console.log(`snpGetStatusProcD [INFO] - Token received: ${token}`);
			
				// Make the API request
				const res = await axios({
				method: 'get',
				url: `https://${snpUrl}:${snpPort}/api/elements/${snpUrl}/config/processorD`,
				headers: {
					"Content-Type": "application/json",
					"Authorization": token,  // Include authorization header
				},
				});
				
				console.log(`snpGetStatusProcD [INFO] - API Response Status: ${res.status}`);
				console.log(`snpGetStatusProcD [INFO] - API Response Data: ${JSON.stringify(res.data)}`);
			
				// Check if 'config' exists in res.data before parsing
				if (!res.data || !res.data.config) {
				console.log("snpGetStatusProcD [ERROR] - No config data found in the response");
				return;
				}
			
		// Parse the config field (as it's a JSON string) in res.data
		const procd = JSON.parse(res.data.config);
		console.log(`snpGetStatusProcD [INFO] - Parsed procd: ${JSON.stringify(procd)}`);
		
		// Check if 'general' and 'personality' exist in procd
		if (procd.general && procd.general.personality) {
		  console.log(`snpGetStatusProcD [INFO] - Personality: ${procd.general.personality}`);
		  
		  // Set the personality as a label in snpProcD metric
		  snpProcD.labels({
			personality: procd.general.personality,  // Access 'personality' in the 'general' object
		  }).set(1);  // Set the value of the metric to 1
		} else {
		  console.log("snpGetStatusProcD [ERROR] - Personality not found in the response");
		}
		
		console.log(`snpGetStatusProcD [INFO] - ${snpUrl} - ${res.status}`);  // Log successful response
		return res;
		} catch (err) {
		  console.log(`snpGetStatusProcD [ERROR] - ${snpUrl} - ${err.message || err}`);
		}
		
		}

// Async function to get PTP Status
async function snpGetStatusPtp(snpUrl, snpPort) {
  try {
    const token = await snpGetToken(snpUrl, snpPort);
    const res = await axios({
      method: 'get',
      url: `https://${snpUrl}:${snpPort}/api/elements/${snpUrl}/status/ptp`,
			timeout: process.env.TIMEOUT_SNP || 3000,
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
      },
    });

		const ptp = res.data.ptpStatus;
		
		var ptpStatusSnp = 1;

		if (ptp.ptpCtlrState === "Locked" & ptp.ptpMasterPresent === "Primary/Secondary") {
			ptpStatusSnp = 0;
		}

		ptpStatusAll.labels({
			clockIdentity: ptp.clockIdentity,
			ptpCtlrState: ptp.ptpCtlrState,
			ptpMasterIP: ptp.ptpMasterIP,
			ptpMasterInterfaceIP: ptp.ptpMasterInterfaceIP,
			ptpMasterPresent: ptp.ptpMasterPresent,
			ptpMasterUUID: ptp.ptpMasterUUID,
			ptpUcipIsMaster: ptp.ptpUcipIsMaster
		}).set(ptpStatusSnp);

		ptpStatus.labels({
			component: 'utc_time',
			unit: 'ms'
		}).set(moment(ptp.ptpUTC, "ddd MMM DD HH:mm:ss YYYY").unix()*1000);

		ptpStatus.labels({
			component: 'biggest_sys_time_update',
			unit: ptp.biggestSysTimeUpdate.split(' ')[1]
		}).set(parseFloat(ptp.biggestSysTimeUpdate.split(' ')[0]));

		ptpStatus.labels({
			component: 'num_sys_time_update',
		}).set(parseFloat(ptp.numSysTimeUpdates.split(' ')[0]));

		ptpStatus.labels({
			component: 'ptp_master_delay',
		}).set(parseFloat(ptp.ptpMasterDelay.split(' ')[0]));

		ptpStatus.labels({
			component: 'ptp_master_offset',
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
			timeout: process.env.TIMEOUT_SNP || 3000,
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
		}).set(0);

		register.setDefaultLabels({hostname: wan.hostName});
		
		// primary
		wanStatusPrimary.labels({
			priEthMACaddr: wan.priEthMACaddr,
			priGateway: wan.priGateway,
			priIpAddr: wan.priIpAddr,
			priIpMask: wan.priIpMask,
			priPortInfo: wan.priPortInfo,
			priSwitchInfo: wan.priSwitchInfo,
		}).set(0);
		wanStatusSecondary.labels({
			secEthMACaddr: wan.secEthMACaddr,
			secGateway: wan.secGateway,
			secIpAddr: wan.secIpAddr,
			secIpMask: wan.secIpMask,
			secPortInfo: wan.secPortInfo,
			secSwitchInfo: wan.secSwitchInfo,
		}).set(0);

		for (let i = 0 ; i < 2; i++) {
			const net = (i == 0) ? "pri" : "sec";

			// rx errs
			wanStatus.labels({
				alarmType: 'wan_alarm',
				component: `errs`,
				network: (i == 0) ? "primary" : "secondary",
				way: "rx",
			}).set(parseFloat(eval(`wan.${net}RxErrs`)));

			// rx overbandwidth
			wanStatus.labels({
				alarmType: 'wan_alarm',
				component: `over_bandwidth`,
				network: (i == 0) ? "primary" : "secondary",
				way: "rx",
			}).set(Number(wan.priRxOverBandwidth));

			for (let n = 0 ; n < 2; n++) {
				const w = (n == 0) ? "Rx" : "Tx";
				// rx & tx pkts
				wanStatus.labels({
					alarmType: 'wan_alarm',
					component: `pkts`,
					network: (i == 0) ? "primary" : "secondary",
					way: w.toLowerCase(),
				}).set(parseFloat(eval(`wan.${net}${w}Pkts`)));

				var wanRate = parseFloat(eval(`wan.${net}${w}Rate`).split(' ')[0])

				// convert all rate Mbps to Gbps
				if (eval(`wan.${net}${w}Rate`).split(' ')[1] === "Mbps") {
					wanRate = parseFloat(eval(`wan.${net}${w}Rate`).split(' ')[0]) / 1000
				}

				// rx & tx rate	
				wanStatus.labels({
					alarmType: 'wan_alarm',
					component: `rate`,
					network: (i == 0) ? "primary" : "secondary",
					way: w.toLowerCase(),
					unit: "Gbps"
				}).set(wanRate);

				var configBw = parseFloat(eval(`wan.${w.toLowerCase()}ConfigBw100G`).split(' ')[0]);

				// convert all config Bw Mbps to Gbps
				if (eval(`wan.${w.toLowerCase()}ConfigBw100G`).split(' ')[1] === "Mbps") {
					configBw = parseFloat(eval(`wan.${w.toLowerCase()}ConfigBw100G`).split(' ')[0]) / 1000
				}

				// rx & tx config Bw 100G
				wanStatus.labels({
					alarmType: 'wan_alarm',
					component: `config_bw_100G`,
					way: w.toLowerCase(),
					unit: "Gbps"
				}).set(configBw);

				// rx & tx config Bw 25G
				["A", "B", "C", "D"].forEach(elmt => {
					wanStatus.labels({
						alarmType: 'wan_alarm',
						component: `config_bw_25G_${elmt}`,
						way: w.toLowerCase(),
					}).set(parseFloat(eval(`wan.${w.toLowerCase()}ConfigBw25G`)[elmt.charCodeAt(0) - 65]));
				});
				

			}
		}

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
			timeout: process.env.TIMEOUT_SNP || 3000,
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
		}).set(0);

		systemStatusAlarmStatsUniqueTypes.set(system.Alarm_Stats.uniqueTypes);
		systemStatusAlarmStatsMinorInstances.set(system.Alarm_Stats.uniqueTypes);
		systemStatusAlarmStatsMajorInstances.set(system.Alarm_Stats.majorInstances);
		
		// fpga configuration alarm
		for (let i = 0; i < 5; i++) {
			systemStatusHwAlarm.labels({
				alarmType: 'configuration_alarm',
				component: `fpga_${i+1}`
			}).set(Number(system.FPGA_HW_Stats[i].Configuration_Alarm));	
		}

		// fpga temp alarm
		for (let i = 0; i < 5; i++) {
			systemStatusHwAlarm.labels({
				alarmType: 'temp_alarm',
				component: `fpga_${i+1}`
			}).set(Number(system.FPGA_HW_Stats[i].Temp_Alarm));	
		}
		
		// fpga fan alarm
		for (let i = 0; i < 5; i++) {
			systemStatusHwAlarm.labels({
				alarmType: 'fan_alarm',
				component: `fpga_${i+1}`
			}).set(Number(system.FPGA_HW_Stats[i].Fan_Alarm));	
		}

		// fpga fan temp
		for (let i = 0; i < 5; i++) {
			systemStatusHwTemp.labels({
				alarmType: 'fan_temp',
				component: `fpga_${i+1}`,
				unit: system.FPGA_HW_Stats[i].Temp.split(' ')[1],
			}).set(parseFloat(system.FPGA_HW_Stats[i].Temp.split(' ')[0]));	
		}

		// front fan alarm
		for (let i = 0; i < 4; i++) {
			systemStatusHwAlarm.labels({
				alarmType: 'fan_alarm',
				component: `front_fan_${i+1}`
			}).set(Number(system.FPGA_HW_Stats[i].Fan_Alarm));	
		}

		// front fan speed
		for (let i = 0; i < 4; i++) {
			systemStatusHwSpeed.labels({
				component: `front_fan_${i+1}`,
				unit: system.Front_Fan_Stats[i].RotationalSpeed.split(' ')[1],
			}).set(Number(system.Front_Fan_Stats[i].RotationalSpeed.split(' ')[0]));	
		}

		// power supply status
		for (let i = 1; i < 3; i++) {
			systemStatusHwAlarm.labels({
				alarmType: 'ps_enable',
				component: `ps_${i}`,
			}).set(Number(eval(`system.Power_Supply_Stats.PS_EN_${i}`)));
			
			systemStatusHwAlarm.labels({
				alarmType: 'ps_present',
				component: `ps_${i}`,
			}).set(Number(eval(`system.Power_Supply_Stats.PS_Present_${i}`)));

			systemStatusHwAlarm.labels({
				alarmType: 'fan_alarm',
				component: `ps_${i}`,
			}).set(Number(eval(`system.Power_Supply_Stats.PS_Fan_Status_${i}`)));
		}

		// board temperature
		systemStatusHwTemp.labels({
			alarmType: 'board_temp',
			component: `main_board`,
			unit: system.Board_Temperatures.Main_Board.split(' ')[1],
		}).set(Number(system.Board_Temperatures.Main_Board.split(' ')[0]));	

		systemStatusHwTemp.labels({
			alarmType: 'board_temp',
			component: `io_board`,
			unit: system.Board_Temperatures.IO_Board.split(' ')[1],
		}).set(Number(system.Board_Temperatures.IO_Board.split(' ')[0]));	
	
		// clean PS general status
		if (system.Power_Supply_Stats.PS_Status === "OK") {
			system.Power_Supply_Stats.PS_Status = 0;
		} else {
			system.Power_Supply_Stats.PS_Status = 1;
		}
		systemStatusHwAlarm.labels({
			alarmType: 'ps_alarm',
			component: `ps_general`,
		}).set(system.Power_Supply_Stats.PS_Status);

		// power supply hot swap
		systemStatusHwAlarm.labels({
			alarmType: 'ps_hot_swap',
			component: `ps_general`,
		}).set(Number(system.Power_Supply_Stats.PS_Hot_Swap));

		// power supply fan alarm
		systemStatusHwAlarm.labels({
			alarmType: 'fan_alarm',
			component: `ps_general`,
		}).set(Number(system.Power_Supply_Stats.PS_Fan_Alarm));
		
		// Clean RX & TX QSFP with null data
		for (let i = 0; i < 2 ; i++) {
			for (let n = 1; n < 5 ; n++) {
				if (eval(`system.QSFP_Stats[${i}].TxPower${n}`) == ("---" || "N/A")) {
					eval(`system.QSFP_Stats[${i}].TxPower${n} = "-120 dBm"`);
				}
				if (eval(`system.QSFP_Stats[${i}].RxPower${n}`) == ("---" || "N/A")) {
					eval(`system.QSFP_Stats[${i}].RxPower${n} = "-120 dBm"`);
				}
			}
		}

		// QSFP status
		for (let i = 0 ; i < 2; i++) {
			systemStatusQSFP.labels({
				alarmType: 'qsfp_present',
				network: (i == 0) ? "primary" : "secondary",
			}).set(Number( system.QSFP_Stats[i].present));	

			systemStatusQSFP.labels({
				alarmType: 'qsfp_dataValid',
				network: (i == 0) ? "primary" : "secondary",
			}).set(Number( system.QSFP_Stats[i].present));	


			systemStatusQSFP.labels({
				vendor_name: system.QSFP_Stats[i].VendorName,
				vendor_pn: system.QSFP_Stats[i].VendorPN,
				vendor_sn: system.QSFP_Stats[i].VendorSN,
				network: (i == 0) ? "primary" : "secondary",
			}).set(Number( system.QSFP_Stats[i].present));	

			systemStatusHwTemp.labels({
				alarmType: 'qsfp_temp',
				component: `qsfp_${(i == 0) ? "primary" : "secondary"}`,
				unit: system.QSFP_Stats[i].Temperature.split(' ')[1],
			}).set(parseFloat(system.QSFP_Stats[i].Temperature.split(' ')[0]));	

			for (let n = 0; n < 4; n++) {
				systemStatusQSFP.labels({
					alarmType: 'qsfp_power',
					network: (i == 0) ? "primary" : "secondary",
					component: `qsfp_link_${n+1}`,
					way: 'rx',
					unit: eval(`system.QSFP_Stats[${i}].RxPower${n+1}.split(' ')[1]`)
				}).set( Number(eval(`system.QSFP_Stats[${i}].RxPower${n+1}.split(' ')[0]`)));	

				systemStatusQSFP.labels({
					alarmType: 'qsfp_power',
					network: (i == 0) ? "primary" : "secondary",
					component: `qsfp_link_${n+1}`,
					way: 'tx',
					unit: eval(`system.QSFP_Stats[${i}].TxPower${n+1}.split(' ')[1]`)
				}).set( Number( eval(`system.QSFP_Stats[${i}].TxPower${n+1}.split(' ')[0]`)));	
			}
		}

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
