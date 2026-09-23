'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { Activity, AlertTriangle, Bell, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronRight, ClipboardList, Copy, Edit3, FileText, LayoutDashboard, Mail, Menu, Plane, Plus, Search, Send, Settings, Sparkles, Trash2, Upload, Users, X, Zap } from 'lucide-react'

type Page = 'Dashboard' | 'Schedule Processor' | 'Customers' | 'Aircraft' | 'Customer Deals' | 'Templates' | 'Airports' | 'FBOs' | 'Alerts' | 'Settings'
type Deal = { id: number; name: string; provider: string; description: string; color: string; tankering: boolean }
type Customer = { id: number; name: string; dealIds: number[]; rule: string; includeTripNumber: boolean; homeBase: string }
type Aircraft = { id: number; tail: string; type: string; customerId: number | null; homeBase: string; avcard: string; expiration: string; active: boolean }
type Email = { id: number; type: 'FBO' | 'Customer'; icao: string; iata?: string; fbo: string; tail: string; customer: string; subject: string; body: string; status: 'Ready' | 'Pending' | 'Draft' }
type Template = { id: number; name: string; type: 'Customer' | 'FBO'; customerIds: number[]; dealIds: number[]; subject: string; body: string; updated: string }
type Airport = { id: number; icao: string; iata: string; name: string; city: string; state: string; countryCode: string; countryName: string }
type FBO = { id: number; iata: string; icao: string; name: string; email: string; phone: string }
type AvcardAlert = { id: number; type: 'AVCARD'; message: 'Expiration'; aircraft: string; note: string; customer: string; expiration: string; status: 'Open' }


const nav: [Page, string, any][] = [
  ['Dashboard', 'Overview', LayoutDashboard],
  ['Schedule Processor', 'Paste & Review', CalendarDays],
  ['Customers', 'Profiles & Rules', Users],
  ['Aircraft', 'Tail Directory', Plane],
  ['Customer Deals', 'Pricing Programs', Activity],
  ['Templates', 'Email Library', FileText],
  ['Airports', 'Airport Directory', Plane],
  ['Alerts', 'Exceptions', Bell],
  ['Settings', 'Configuration', Settings]
]

const initialDeals: Deal[] = [
  { id: 1, name: 'CAA Network Pricing', provider: 'CAA', description: 'Corporate Aircraft Association network pricing program.', color: '#1976e5', tankering: true },
  { id: 2, name: 'Atlantic Pricing', provider: 'Atlantic', description: 'Atlantic Aviation negotiated pricing.', color: '#18a66b', tankering: false },
  { id: 3, name: 'Phillips 66 Pricing', provider: 'Phillips 66', description: 'Phillips 66 branded fuel pricing program.', color: '#e68a16', tankering: true },
  { id: 4, name: 'Signature Pricing', provider: 'Signature', description: 'Signature Flight Support negotiated pricing.', color: '#7657c7', tankering: false },
  { id: 5, name: 'Tankering', provider: 'Field Services', description: 'Fuel tankering analysis and optimization service.', color: '#0b9c63', tankering: true }
]

const initialCustomers: Customer[] = [
  { id: 1, name: 'Ahold', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 2, name: 'Air Product', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 3, name: 'Alticor', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 4, name: 'Aramark', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 5, name: 'Barrick Gold', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 6, name: 'Brasfield & Gorrie', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 7, name: 'CVS Health', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 8, name: 'Eaton', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 9, name: 'Eli Lilly', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 10, name: 'EMC Corporation', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 11, name: 'Encompass', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 12, name: 'Fanatics', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 13, name: 'Fed Ex', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 14, name: 'FG Aviation', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 15, name: 'First Data', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 16, name: 'Honeywell', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 17, name: 'Humana', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 18, name: 'Indianapolis Colts', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 19, name: 'International Paper', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 20, name: 'Johnson & Johnson', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 21, name: 'Liberty Global', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 22, name: 'Lilac Communications', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 23, name: 'M Automotive', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 24, name: 'MGM Resorts', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 25, name: 'MP Air', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 26, name: 'MSG Aviation', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 27, name: 'Nissan', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 28, name: 'Pfizer', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 29, name: 'ROP Aviation', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 30, name: 'Sedgwick', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 31, name: 'SMGM', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 32, name: 'Starr Equipment', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 33, name: 'Swagelok', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 34, name: 'T-Mobile', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 35, name: 'UHC', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 36, name: 'Whirlpool', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' },
  { id: 37, name: 'Zimmer', dealIds: [], rule: 'Not configured', includeTripNumber: false, homeBase: '' }
]

const initialAircraft: Aircraft[] = [
  { id: 1, tail: 'N82KW', type: 'Citation XLS', customerId: 1, homeBase: '', avcard: '6010-2950-0157-7742', expiration: '07/26', active: true },
  { id: 2, tail: 'N838C', type: 'Citation XLS', customerId: 1, homeBase: '', avcard: '6010-2950-0157-7759', expiration: '07/26', active: true },
  { id: 3, tail: 'N343AP', type: 'Falcon 7X', customerId: 2, homeBase: '', avcard: 'CHECK CHEAT SHEET', expiration: 'CHECK CHEAT SHEET', active: true },
  { id: 4, tail: 'N344AP', type: 'Gulfstream G650', customerId: 2, homeBase: '', avcard: 'CHECK CHEAT SHEET', expiration: 'CHECK CHEAT SHEET', active: true },
  { id: 5, tail: 'N250DV', type: 'H145', customerId: 3, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 6, tail: 'N251DV', type: 'G600', customerId: 3, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 7, tail: 'N252DV', type: 'G550', customerId: 3, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 8, tail: 'N254DV', type: 'Praetor 600', customerId: 3, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 9, tail: 'N255DV', type: 'Praetor 600', customerId: 3, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 10, tail: 'N256DV', type: 'Citation CJ4', customerId: 3, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 11, tail: 'N257DV', type: 'Citation CJ4', customerId: 3, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 12, tail: 'N258DV', type: 'Praetor 600', customerId: 3, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 13, tail: 'N268RB', type: 'G600', customerId: 3, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 14, tail: 'N316VA', type: 'G550', customerId: 3, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 15, tail: 'N327VA', type: 'S-76', customerId: 3, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 16, tail: 'N524AC', type: 'G550', customerId: 3, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 17, tail: 'N527AC', type: 'G600', customerId: 3, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 18, tail: 'N11A', type: 'Global 5000', customerId: 4, homeBase: '', avcard: '6010-2950-0206-2819', expiration: '07/26', active: true },
  { id: 19, tail: 'N594GJ', type: 'Global 5000', customerId: 4, homeBase: '', avcard: '6010-2950-0202-3837', expiration: '07/26', active: true },
  { id: 20, tail: 'CGBGC', type: 'G550', customerId: 5, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 21, tail: 'CGGPM', type: 'G550', customerId: 5, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 22, tail: 'N216BG', type: 'Citation XLS', customerId: 6, homeBase: '', avcard: '6010-2950-0167-2147', expiration: '08/26', active: true },
  { id: 23, tail: 'N220BG', type: 'Citation XLS', customerId: 6, homeBase: '', avcard: '6010-2950-0172-7438', expiration: '05/25', active: true },
  { id: 24, tail: 'N214TF', type: 'Falcon 2000', customerId: 7, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 25, tail: 'N327RX', type: 'Falcon 2000', customerId: 7, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 26, tail: 'N812RX', type: 'Falcon 2000', customerId: 7, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 27, tail: 'N738E', type: 'Challenger 300', customerId: 8, homeBase: '', avcard: '6010-2950-0114-6647', expiration: '08/25', active: true },
  { id: 28, tail: 'N739E', type: 'Challenger 300', customerId: 8, homeBase: '', avcard: '6010-2950-0138-0840', expiration: '08/25', active: true },
  { id: 29, tail: 'N742E', type: 'Challenger 300', customerId: 8, homeBase: '', avcard: '6010-2950-0096-6326', expiration: '08/26', active: true },
  { id: 30, tail: 'N746E', type: 'Challenger 300', customerId: 8, homeBase: '', avcard: '6010-2950-0065-8642', expiration: '08/25', active: true },
  { id: 31, tail: 'N307EL', type: 'G500', customerId: 9, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 32, tail: 'N308EL', type: 'G500', customerId: 9, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 33, tail: 'N309EL', type: 'G500', customerId: 9, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 34, tail: 'N280TM', type: 'G280', customerId: 10, homeBase: '', avcard: '6010-2950-0180-3973', expiration: '08/26', active: true },
  { id: 35, tail: 'N285TM', type: 'G280', customerId: 10, homeBase: '', avcard: '6010-2950-0162-8453', expiration: '08/25', active: true },
  { id: 36, tail: 'N84EH', type: 'Challenger 350', customerId: 11, homeBase: '', avcard: '6010-2950-0201-4695', expiration: '08/25', active: true },
  { id: 37, tail: 'N95EH', type: 'Challenger 350', customerId: 11, homeBase: '', avcard: '6010-2950-0206-9509', expiration: '08/26', active: true },
  { id: 38, tail: 'N223KR', type: 'Agusta AW139', customerId: 12, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 39, tail: 'N4FN', type: 'Agusta AW139', customerId: 12, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 40, tail: 'N721KJ', type: 'G550', customerId: 12, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 41, tail: 'N1FE', type: 'Bombardier Global 6000', customerId: 13, homeBase: '', avcard: '6010-2950-0138-1160', expiration: '10/25', active: true },
  { id: 42, tail: 'N21FE', type: 'Challenger 300', customerId: 13, homeBase: '', avcard: '6010-2950-0138-1079', expiration: '10/25', active: true },
  { id: 43, tail: 'N24FE', type: 'Challenger 300', customerId: 13, homeBase: '', avcard: '6010-2950-0138-1080', expiration: '10/25', active: true },
  { id: 44, tail: 'N26FE', type: 'Challenger 300', customerId: 13, homeBase: '', avcard: '6010-2950-0138-1095', expiration: '10/25', active: true },
  { id: 45, tail: 'N28FE', type: 'Challenger 300', customerId: 13, homeBase: '', avcard: '6010-2950-0138-1103', expiration: '10/25', active: true },
  { id: 46, tail: 'N2FE', type: 'Bombardier Global 6000', customerId: 13, homeBase: '', avcard: '6010-2950-0138-1178', expiration: '10/25', active: true },
  { id: 47, tail: 'N35FE', type: 'Challenger 300', customerId: 13, homeBase: '', avcard: '6010-2950-0138-1111', expiration: '10/25', active: true },
  { id: 48, tail: 'N37FE', type: 'Challenger 300', customerId: 13, homeBase: '', avcard: '6010-2950-0138-1129', expiration: '10/25', active: true },
  { id: 49, tail: 'N39FE', type: 'Challenger 300', customerId: 13, homeBase: '', avcard: '6010-2950-0138-1137', expiration: '10/25', active: true },
  { id: 50, tail: 'N3FE', type: 'Challenger 605', customerId: 13, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 51, tail: 'N43FE', type: 'Challenger 300', customerId: 13, homeBase: '', avcard: '6010-2950-0138-1145', expiration: '10/25', active: true },
  { id: 52, tail: 'N6FE', type: 'Global 6500', customerId: 13, homeBase: '', avcard: '6010-2950-0182-6818', expiration: '10/26', active: true },
  { id: 53, tail: 'N333FG', type: 'Gulfstream GIV', customerId: 14, homeBase: '', avcard: '6010-2950-0166-7923', expiration: '10/26', active: true },
  { id: 54, tail: 'N451GV', type: 'G550', customerId: 15, homeBase: '', avcard: '6010-2950-0154-5320', expiration: '10/26', active: true },
  { id: 55, tail: 'N641BW', type: 'G600', customerId: 15, homeBase: '', avcard: '6010-2950-0187-2028', expiration: '10/26', active: true },
  { id: 56, tail: 'N138B', type: 'Dassault Falcon 7X', customerId: 16, homeBase: '', avcard: 'DO NOT SEND HANDLING', expiration: '01/24', active: true },
  { id: 57, tail: 'N148B', type: 'Gulfstream G650', customerId: 16, homeBase: '', avcard: 'DO NOT SEND HANDLING', expiration: '01/24', active: true },
  { id: 58, tail: 'N151B', type: 'Gulfstream G600', customerId: 16, homeBase: '', avcard: 'DO NOT SEND HANDLING', expiration: '01/24', active: true },
  { id: 59, tail: 'N161B', type: 'Gulfstream G600', customerId: 16, homeBase: '', avcard: 'DO NOT SEND HANDLING', expiration: '01/24', active: true },
  { id: 60, tail: 'N599H', type: 'Gulfstream GV', customerId: 16, homeBase: '', avcard: 'DO NOT SEND HANDLING', expiration: '01/24', active: true },
  { id: 61, tail: 'N933H', type: 'Gulfstream G650', customerId: 16, homeBase: '', avcard: 'DO NOT SEND HANDLING', expiration: '01/24', active: true },
  { id: 62, tail: 'N988H', type: 'Dassault Falcon 8X', customerId: 16, homeBase: '', avcard: 'DO NOT SEND HANDLING', expiration: '01/24', active: true },
  { id: 63, tail: 'N733A', type: 'Falcon 2000 LX', customerId: 17, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 64, tail: 'N733G', type: 'Falcon 50EX', customerId: 17, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 65, tail: 'N733H', type: 'Falcon 2000 LX', customerId: 17, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 66, tail: 'N733K', type: 'Falcon 2000 LX', customerId: 17, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 67, tail: 'N101TD', type: 'BBJ 737-700', customerId: 18, homeBase: '', avcard: 'AVCARD IN FRONT', expiration: 'AVCARD IN FRONT', active: true },
  { id: 68, tail: 'N102TD', type: 'G550', customerId: 18, homeBase: '', avcard: 'AVCARD IN FRONT', expiration: 'AVCARD IN FRONT', active: true },
  { id: 69, tail: 'N106TD', type: 'GIV', customerId: 18, homeBase: '', avcard: 'AVCARD IN FRONT', expiration: 'AVCARD IN FRONT', active: true },
  { id: 70, tail: 'N107TD', type: 'GIV', customerId: 18, homeBase: '', avcard: 'AVCARD IN FRONT', expiration: 'AVCARD IN FRONT', active: true },
  { id: 71, tail: 'N931FL', type: 'G550', customerId: 18, homeBase: '', avcard: 'AVCARD IN FRONT', expiration: 'AVCARD IN FRONT', active: true },
  { id: 72, tail: 'N881Q', type: 'Falcon 2000LXS', customerId: 19, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 73, tail: 'N885A', type: 'Falcon 2000LXS', customerId: 19, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 74, tail: 'N887X', type: 'Falcon 7X', customerId: 19, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 75, tail: 'N30QJ', type: 'G600', customerId: 20, homeBase: '', avcard: '6010-2950-0201-0636', expiration: '12/25', active: true },
  { id: 76, tail: 'N400J', type: 'G650', customerId: 20, homeBase: '', avcard: '6010-2950-0038-0570', expiration: '12/25', active: true },
  { id: 77, tail: 'N500J', type: 'G550', customerId: 20, homeBase: '', avcard: '6010-2950-0038-0189', expiration: '12/25', active: true },
  { id: 78, tail: 'N60QJ', type: 'G600', customerId: 20, homeBase: '', avcard: '6010-2950-0201-0644', expiration: '12/25', active: true },
  { id: 79, tail: 'N700J', type: 'AW139', customerId: 20, homeBase: '', avcard: '6010-2950-0038-0213', expiration: '12/25', active: true },
  { id: 80, tail: 'N800J', type: 'G650', customerId: 20, homeBase: '', avcard: '6010-2950-0038-0205', expiration: '12/25', active: true },
  { id: 81, tail: 'N250LG', type: 'Falcon 7X', customerId: 21, homeBase: '', avcard: '6010-2950-0201-6682', expiration: '01/25', active: true },
  { id: 82, tail: 'N730LM', type: 'Falcon 900 EX', customerId: 21, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 83, tail: 'N96LA', type: 'Falcon 900EX', customerId: 22, homeBase: '', avcard: 'TWO AVCARDS ON FILE', expiration: '', active: true },
  { id: 84, tail: 'N40ZA', type: 'Falcon 900EX', customerId: 22, homeBase: '', avcard: 'TWO AVCARDS ON FILE', expiration: '', active: true },
  { id: 85, tail: 'N737CM', type: 'Boeing 737-700', customerId: 23, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 86, tail: 'N92BS', type: 'GIV', customerId: 23, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 87, tail: 'N2QG', type: 'Citation Sovereign', customerId: 24, homeBase: '', avcard: '6010-2950-0147-8743', expiration: '02/25', active: true },
  { id: 88, tail: 'N721MM', type: 'G650', customerId: 24, homeBase: '', avcard: '6010-2950-0137-4199', expiration: '02/26', active: true },
  { id: 89, tail: 'N781MM', type: 'Embraer Legacy 500', customerId: 24, homeBase: '', avcard: '6010-2950-0145-7119', expiration: '02/26', active: true },
  { id: 90, tail: 'N782MM', type: 'Embraer Legacy 500', customerId: 24, homeBase: '', avcard: '6010-2950-0145-7120', expiration: '02/26', active: true },
  { id: 91, tail: 'N783MM', type: 'Embraer Lineage 1000', customerId: 24, homeBase: '', avcard: '6010-2950-0145-7135', expiration: '02/26', active: true },
  { id: 92, tail: 'N785MM', type: 'Embraer Lineage 1000', customerId: 24, homeBase: '', avcard: '6010-2950-0182-0134', expiration: '02/26', active: true },
  { id: 93, tail: 'N786MM', type: 'Embraer Legacy 500', customerId: 24, homeBase: '', avcard: '6010-2950-0193-3614', expiration: '02/25', active: true },
  { id: 94, tail: 'N112MY', type: 'Global 6000', customerId: 25, homeBase: '', avcard: '6010-2950-0110-2533', expiration: '02/26', active: true },
  { id: 95, tail: 'N729VS', type: 'Global 7500', customerId: 25, homeBase: '', avcard: '6010-2950-0174-7931', expiration: '02/26', active: true },
  { id: 96, tail: 'N107VS', type: 'Gulfstream GV', customerId: 26, homeBase: '', avcard: 'DO NOT SEND HANDLING', expiration: '01/24', active: true },
  { id: 97, tail: 'N176KH', type: 'Gulfstream G650ER', customerId: 26, homeBase: '', avcard: 'DO NOT SEND HANDLING', expiration: '01/24', active: true },
  { id: 98, tail: 'N350PD', type: 'Challenger 350', customerId: 26, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 99, tail: 'N5465M', type: 'Gulfstream G550', customerId: 26, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 100, tail: 'N155AN', type: 'Challenger 605', customerId: 27, homeBase: '', avcard: '6010-2950-0121-6424', expiration: '01/25', active: true },
  { id: 101, tail: 'N5CP', type: 'Gulfstream G650', customerId: 28, homeBase: '', avcard: '6010-2950-0161-1947', expiration: '03/25', active: true },
  { id: 102, tail: 'N650CP', type: 'Gulfstream G650', customerId: 28, homeBase: '', avcard: '6010-2950-0200-3623', expiration: '03/25', active: true },
  { id: 103, tail: 'N6CP', type: 'Gulfstream G650', customerId: 28, homeBase: '', avcard: '6010-2950-0161-1954', expiration: '03/25', active: true },
  { id: 104, tail: 'N90CP', type: 'Gulfstream G650', customerId: 28, homeBase: '', avcard: '6010-2950-0205-9559', expiration: '03/26', active: true },
  { id: 105, tail: 'N836MF', type: 'G650', customerId: 29, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 106, tail: 'N838MF', type: 'G650', customerId: 29, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 107, tail: 'N144S', type: 'G500', customerId: 30, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 108, tail: 'N244S', type: 'G600', customerId: 30, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 109, tail: 'N286RW', type: 'G280', customerId: 30, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 110, tail: 'N544S', type: 'Falcon 2000', customerId: 30, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 111, tail: 'N844S', type: 'LJ60', customerId: 30, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 112, tail: 'N12MG', type: 'Citation CJ4', customerId: 31, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 113, tail: 'N50MG', type: 'Cessna 70', customerId: 31, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 114, tail: 'N54HG', type: 'Falcon 900', customerId: 32, homeBase: '', avcard: '6010-2950-0073-9509', expiration: '05/25', active: true },
  { id: 115, tail: 'N65FG', type: 'Gulfstream G650', customerId: 32, homeBase: '', avcard: '6010-2950-0148-1200', expiration: '05/25', active: true },
  { id: 116, tail: 'N289K', type: 'G280', customerId: 33, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 117, tail: 'N589K', type: 'G550', customerId: 33, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 118, tail: 'N425TM', type: 'Gulfstream G550', customerId: 34, homeBase: '', avcard: '60102-9500-178-9222', expiration: '04/26', active: true },
  { id: 119, tail: 'N244C', type: 'FALCON 2000LX', customerId: 35, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 120, tail: 'N264V', type: 'FALCON 2000LX', customerId: 35, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 121, tail: 'N436C', type: 'FALCON 2000LX', customerId: 35, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 122, tail: 'N445H', type: 'Gulfstream 550', customerId: 35, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 123, tail: 'N57UH', type: 'Gulfstream GV', customerId: 35, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 124, tail: 'N851M', type: 'FALCON 2000LX', customerId: 35, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 125, tail: 'N954GA', type: 'Gulfstream 600', customerId: 35, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 126, tail: 'N1900W', type: 'G600', customerId: 36, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 127, tail: 'N1908W', type: 'Falcon 2000LXS', customerId: 36, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 128, tail: 'N1911W', type: 'G600', customerId: 36, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 129, tail: 'N350ZB', type: 'Challenger 350', customerId: 37, homeBase: '', avcard: '', expiration: '', active: true },
  { id: 130, tail: 'N650ZB', type: 'G650', customerId: 37, homeBase: '', avcard: '', expiration: '', active: true }
]

const flights: string[][] = []

const initialTemplates: Template[] = [
  { id: 1, name: 'ABC – Schedule', type: 'Customer', customerIds: [1], dealIds: [], subject: 'Fuel Reservation – {{TAIL}} – {{ROUTE}} – {{DEPARTURE_DATE}}', body: 'Hello {{CUSTOMER}},\n\nPlease review the fuel reservation for {{TAIL}}.\n\n{{TRIP_NUMBER_LINE}}Route: {{ROUTE}}\nDeparture Date: {{DEPARTURE_DATE}}\nETD: {{ETD}}\nETA: {{ETA}}\nFBO: {{FBO}}\nAgent: {{AGENT}}\n\nBest regards,\nWorld Fuel Services', updated: 'Sep 10, 2026' },
  { id: 2, name: 'FBO – Handling Request', type: 'FBO', customerIds: [], dealIds: [1], subject: 'Handling Request – {{TAIL}} – {{ICAO}} – {{ARRIVAL_MONTH_DAY}}', body: '<p>We have <b>{{TAIL}}</b> (<b>{{DEPARTURE_ICAO}}</b>/<b>{{ARRIVAL_ICAO}}</b>) coming to <b>{{ARRIVAL_AIRPORT}}</b>/<b>{{ICAO}}</b> on <b>{{ARRIVAL_MONTH_DAY}} at {{ARRIVAL_TIME}} lcl</b> and departing <b>{{DEPARTURE_MONTH_DAY}} at {{DEPARTURE_TIME}} lcl</b>. Times are subject to change. <b>{{CUSTOMER}}&apos;s Dispatch Team</b> will contact you directly to provide trip timing, changes, or any services they require.</p>', updated: 'Sep 10, 2026' },
  { id: 3, name: 'XYZ – Custom', type: 'Customer', customerIds: [2], dealIds: [], subject: 'Fuel Reservation – {{TAIL}} – {{ROUTE}} – {{DEPARTURE_DATE}}', body: 'Hello {{CUSTOMER}},\n\nPlease review the fuel reservation for {{TAIL}}.\n\n{{TRIP_NUMBER_LINE}}Route: {{ROUTE}}\nDeparture Date: {{DEPARTURE_DATE}}\nETD: {{ETD}}\nETA: {{ETA}}\nFBO: {{FBO}}\nAgent: {{AGENT}}\n\nBest regards,\nWorld Fuel Services', updated: 'Sep 5, 2026' },
  { id: 4, name: 'International Handling', type: 'FBO', customerIds: [], dealIds: [], subject: 'Handling Request – {{TAIL}} – {{ICAO}} – {{ARRIVAL_MONTH_DAY}}', body: '<p>We have <b>{{TAIL}}</b> (<b>{{DEPARTURE_ICAO}}</b>/<b>{{ARRIVAL_ICAO}}</b>) coming to <b>{{ARRIVAL_AIRPORT}}</b>/<b>{{ICAO}}</b> on <b>{{ARRIVAL_MONTH_DAY}} at {{ARRIVAL_TIME}} lcl</b> and departing <b>{{DEPARTURE_MONTH_DAY}} at {{DEPARTURE_TIME}} lcl</b>. Times are subject to change. <b>{{CUSTOMER}}&apos;s Dispatch Team</b> will contact you directly to provide trip timing, changes, or any services they require.</p>', updated: 'Aug 28, 2026' }
]

function Logo() { return <div className="logo"><img src="/world-fuel-services-logo-transparent.png" alt="World Fuel Services" /></div> }

export default function App() {
  const [page, setPage] = useState<Page>('Dashboard')
  const [mobile, setMobile] = useState(false)
  const [query, setQuery] = useState('')
  const [schedule, setSchedule] = useState('')
  const [generatedEmails, setGeneratedEmails] = useState<Email[]>([])
  const [toast, setToast] = useState('')
  const [deals, setDeals] = useState<Deal[]>(initialDeals)
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [aircraft, setAircraft] = useState<Aircraft[]>(initialAircraft)
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [emailType, setEmailType] = useState<'FBO' | 'Customer'>('FBO')
  const [templates, setTemplates] = useState<Template[]>(initialTemplates)
  const [alertTick, setAlertTick] = useState(0)
  useEffect(() => { const timer = window.setInterval(() => setAlertTick(t => t + 1), 24 * 60 * 60 * 1000); return () => window.clearInterval(timer) }, [])
  const avcardAlerts = useMemo(() => buildAvcardAlerts(aircraft, customers), [aircraft, customers, alertTick])

  function notify(message: string) { setToast(message); window.setTimeout(() => setToast(''), 2200) }
  const title = page === 'Dashboard' ? '' : page
  const routeInfo = useMemo(() => parseSchedule(schedule), [schedule])
  const emails = generatedEmails

  return <div className="shell">
    <aside className={mobile ? 'sidebar open' : 'sidebar'}><Logo /><div className="sideNav">{nav.map(([p, sub, Icon]) => <button key={p} className={page === p ? 'navItem active' : 'navItem'} onClick={() => { setPage(p); setMobile(false) }}><Icon size={18} /><span>{p}</span><small>{sub}</small>{p === 'Alerts' && avcardAlerts.length > 0 && <em className="navAlertBadge">{avcardAlerts.length}</em>}</button>)}</div><div className="sideFoot"><div className="connected"><span></span><div><b>Operations</b><small>System connected</small></div></div><div className="tagline">AVIATION<br />FUELS<br />PEOPLE<br />POSSIBILITIES™</div></div></aside>
    <main className="main"><header><button className="hamb" onClick={() => setMobile(!mobile)}><Menu /></button><button className="iconBtn topAlertBtn" onClick={() => { setPage('Alerts'); notify('Opening alerts') }} aria-label="Alerts"><Bell size={19} /><em>{avcardAlerts.length}</em></button></header>
      <div className="content">{page !== 'Dashboard' && <div className="pageTitle"><div><h1>{title}</h1><p>{page === 'Schedule Processor' ? 'Paste your Excel schedule, review the communications that will be generated, and confirm.' : page === 'Customer Deals' ? 'Create the pricing deals and programs that can be assigned to customers.' : 'Manage aviation fuel operations, schedules and communications.'}</p></div></div>}
        {page === 'Dashboard' && <Dashboard emails={emails} emailType={emailType} setEmailType={setEmailType} selectedEmail={selectedEmail} setSelectedEmail={setSelectedEmail} notify={notify} routeInfo={routeInfo} />}
        {page === 'Schedule Processor' && <ScheduleProcessor schedule={schedule} setSchedule={setSchedule} notify={notify} deals={deals} customers={customers} aircraft={aircraft} templates={templates} setGeneratedEmails={setGeneratedEmails} setPage={setPage} />}
        {page === 'Customer Deals' && <CustomerDeals deals={deals} setDeals={setDeals} notify={notify} />}
        {page === 'Customers' && <Customers customers={customers} setCustomers={setCustomers} deals={deals} notify={notify} />}
        {page === 'Aircraft' && <AircraftPage aircraft={aircraft} setAircraft={setAircraft} customers={customers} deals={deals} notify={notify} />}
        {page === 'Templates' && <Templates templates={templates} setTemplates={setTemplates} customers={customers} deals={deals} notify={notify} />}{page === 'Airports' && <Airports notify={notify} />}{page === 'Alerts' && <Alerts alerts={avcardAlerts} />}{page === 'Settings' && <SettingsPage notify={notify} />}
      </div></main>{toast && <div className="toast"><CheckCircle2 size={17} />{toast}</div>}
  </div>
}

const SCHEDULE_COLUMNS = ['Trip Number','Departure Date','ETD','Aircraft','Departure ICAO','Departure Airport','Arrival ICAO','Arrival Airport','FT','Crew','Arrival Date','ETA','Leg Number','Client','Agent','FBO']
const HEADER_ALIASES: Record<string, number> = {
  'utrip':0,'trip':0,'tripnumber':0,'tripnumber#':0,'trip#':0,
  'deptdate':1,'departuredate':1,'departure':1,
  'etd':2,'aircraft':3,
  'depticao':4,'departureicao':4,'depicao':4,
  'departureairport':5,
  'arrvicao':6,'arrivalicao':6,'arricao':6,
  'arrivalairport':7,'arrival':7,
  'ft':8,'crew':9,'arrvdate':10,'arrivaldate':10,
  'eta':11,'leg':12,'legnumber':12,
  'client':13,'agent':14,'fbo':15
}
function normalizeHeader(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9#]/g, '')
}
function cleanFboName(value: string) {
  if (!value) return ''
  let fbo = value.replace(/\s+/g, ' ').trim()
  // Remove phone numbers in common US/international formats, including extensions.
  fbo = fbo.replace(/(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}(?:\s*(?:x|ext\.?)\s*\d+)?/gi, '')
  fbo = fbo.replace(/\s*[,;|/-]?\s*(?:phone|ph|tel|telephone)\s*:?\s*$/i, '')
  fbo = fbo.replace(/\s*[-–—,;|]\s*$/, '').trim()
  // Strip a leading 3-letter airport code when it is clearly a prefix.
  fbo = fbo.replace(/^[A-Z]{3}\s*[-–—:]\s*/i, '').trim()
  return fbo || value.trim()
}

function parseSchedule(value: string) {
  const raw = value.trim() ? value.trim().split(/\r?\n/).filter(Boolean).map(l => l.split('\t')) : []
  if (!raw.length) return { rows: [], hasHeader: false }
  const first = raw[0].map(normalizeHeader)
  const recognized = first.filter(h => Object.prototype.hasOwnProperty.call(HEADER_ALIASES, h)).length
  const hasHeader = recognized >= 5
  const data = hasHeader ? raw.slice(1) : raw
  if (!hasHeader) return { rows: data.map(r => { const out = Array(16).fill(''); r.slice(0,16).forEach((v,i) => out[i] = i === 15 ? cleanFboName(v) : v); return out }), hasHeader: false }
  return { rows: data.map(r => {
    const out = Array(16).fill('')
    first.forEach((h, sourceIndex) => {
      const target = HEADER_ALIASES[h]
      if (target !== undefined) out[target] = sourceIndex === 15 || target === 15 ? cleanFboName(r[sourceIndex] || '') : (r[sourceIndex] || '')
    })
    return out
  }), hasHeader: true }
}
function Stat({ icon: Icon, label, value, detail }: { icon: any; label: string; value: string; detail: string }) { return <div className="stat"><div className="statIcon"><Icon size={20} /></div><div><b>{value}</b><span>{label}</span><small>{detail}</small></div></div> }

function Dashboard({ emails, emailType, setEmailType, selectedEmail, setSelectedEmail, notify, routeInfo }: { emails: Email[]; emailType: 'FBO' | 'Customer'; setEmailType: (t: 'FBO' | 'Customer') => void; selectedEmail: Email | null; setSelectedEmail: (e: Email | null) => void; notify: (s: string) => void; routeInfo: { rows: string[][] } }) {
  const active = routeInfo.rows[0] || Array(16).fill('')
  const hasSchedule = routeInfo.rows.length > 0
  const customer = active[13] || '', tail = active[3] || '', fbo = active[15] || ''
  const route = hasSchedule ? Array.from(new Set(routeInfo.rows.flatMap(r => [r[4], r[6]].filter(Boolean)))).join(' → ') : ''
  const visibleEmails = emails.filter(e => e.type === emailType)
  const currentSelected = selectedEmail && visibleEmails.some(e => e.id === selectedEmail.id) ? selectedEmail : (visibleEmails[0] || null)
  const [selectedFboByEmail, setSelectedFboByEmail] = useState<Record<number, number | null>>({})
  const [airnavFbos, setAirnavFbos] = useState<FBO[]>([])
  const [airnavLoading, setAirnavLoading] = useState(false)
  const [airnavError, setAirnavError] = useState('')
  const selectedFboId = currentSelected?.type === 'FBO' ? (selectedFboByEmail[currentSelected.id] || null) : null
  const isUsAirnav = !!currentSelected?.icao && /^K[A-Z0-9]{3}$/.test(String(currentSelected.icao).trim().toUpperCase())

  useEffect(() => {
    if (!currentSelected || currentSelected.type !== 'FBO' || !isUsAirnav) {
      setAirnavFbos([])
      setAirnavLoading(false)
      setAirnavError('')
      return
    }
    const controller = new AbortController()
    setAirnavLoading(true)
    setAirnavError('')
    fetch('/api/airports?airnav=' + encodeURIComponent(String(currentSelected.icao).trim().toUpperCase()), { signal: controller.signal })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('AirNav lookup failed')))
      .then(data => setAirnavFbos((data.rows || []) as FBO[]))
      .catch(error => { if (error?.name !== 'AbortError') { setAirnavFbos([]); setAirnavError('AirNav FBO lookup unavailable') } })
      .finally(() => setAirnavLoading(false))
    return () => controller.abort()
  }, [currentSelected?.id, currentSelected?.icao, isUsAirnav])

  const matchingFbos = useMemo(() => {
    if (!currentSelected || currentSelected.type !== 'FBO') return []
    const iata = String(currentSelected.iata || '').trim().toUpperCase()
    const icao = String(currentSelected.icao || '').trim().toUpperCase()
    if (isUsAirnav) return airnavFbos
    return []
  }, [currentSelected, fbos, airnavFbos, isUsAirnav])

  const selectedFbo = matchingFbos.find(f => f.id === selectedFboId) || null

  useEffect(() => {
    if (!currentSelected || currentSelected.type !== 'FBO') return
    setSelectedFboByEmail(prev => {
      if (prev[currentSelected.id] !== undefined) return prev
      return { ...prev, [currentSelected.id]: matchingFbos.length === 1 ? matchingFbos[0].id : null }
    })
  }, [currentSelected?.id, currentSelected?.type, matchingFbos])

  async function openInFront(subjectText: string, bodyText: string) {
    if (!currentSelected || currentSelected.type !== 'FBO') return notify('Select an FBO email first')
    if (!selectedFbo) return notify('Select an FBO from the location dropdown first')
    if (!selectedFbo.email) return notify('The selected FBO has no email listed by AirNav')
    const subject = subjectText.trim()
    const body = bodyText.trim()
    const mailto = 'mailto:' + encodeURIComponent(selectedFbo.email) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body)
    try {
      await navigator.clipboard.writeText('To: ' + selectedFbo.email + '\nSubject: ' + subject + '\n\n' + body)
      notify('Recipient, subject and body copied. Opening Front…')
    } catch {
      notify('Opening Front…')
    }
    window.location.href = mailto
  }

  return <>
    <div className="hero"><div><small className="heroBrand">CORPORATE FUEL MANAGEMENT</small><small>WELCOME TO</small><h2>Turn schedules<br />into action.</h2><p>Faster. Smarter. Together.</p></div><div className="planeGraphic">✈</div><div className="heroTag">AVIATION<br />FUELS<br />PEOPLE<br />POSSIBILITIES™</div></div>
    <div className="stats"><Stat icon={Users} value={customer} label="Customer" detail={hasSchedule ? 'Current Schedule' : ''} /><Stat icon={Plane} value={tail} label="Tail" detail={hasSchedule ? '1 aircraft' : ''} /><Stat icon={Activity} value={route} label="Route" detail={hasSchedule ? (Math.max(0, route.split(' → ').length - 1) + ' legs') : ''} /><Stat icon={Zap} value={fbo} label="FBO" detail={hasSchedule ? 'Primary FBO' : ''} /><Stat icon={CalendarDays} value={active[2] || ''} label="ETD" detail={hasSchedule ? (active[1] || '') : ''} /><Stat icon={CalendarDays} value={active[11] || ''} label="ETA" detail={hasSchedule ? (active[10] || '') : ''} /><Stat icon={Users} value={active[14] || ''} label="Agent" detail={hasSchedule ? customer : ''} /></div>
    {emails.length > 0 && currentSelected && <div className="emailLayout"><div className="panel emailPanel"><div className="tabs"><button className={emailType === 'FBO' ? 'tab active' : 'tab'} onClick={() => { setEmailType('FBO'); setSelectedEmail(emails.find(e => e.type === 'FBO') || null) }}>FBO Emails ({emails.filter(e => e.type === 'FBO').length})</button><button className={emailType === 'Customer' ? 'tab active' : 'tab'} onClick={() => { setEmailType('Customer'); setSelectedEmail(emails.find(e => e.type === 'Customer') || null) }}>Customer Emails ({emails.filter(e => e.type === 'Customer').length})</button></div><div className="panelHead"><div><h3><Mail size={19} /> {emailType} Emails</h3><p>Click an email to preview the generated template.</p></div><div className="filters"><span><Search size={13} /> Search by ICAO, FBO, subject...</span><span>All Statuses⌄</span></div></div><div className="tableWrap"><table><thead><tr><th>ICAO</th><th>FBO</th><th>Subject</th><th>Aircraft</th><th>Date/Time</th><th>Status</th><th></th></tr></thead><tbody>{visibleEmails.map(e => <tr key={e.id} className={currentSelected.id === e.id ? 'selectedRow' : ''} onClick={() => setSelectedEmail(e)}><td><b>{e.icao}</b></td><td>{e.fbo}</td><td>{stripHtml(e.subject)}</td><td>{e.tail}</td><td>{active[1] || ''} {active[2] || ''}</td><td><span className="status ready"><i />{e.status}</span></td><td><button className="tiny" onClick={ev => { ev.stopPropagation(); setSelectedEmail(e) }}><Mail size={13} /></button></td></tr>)}</tbody></table></div></div><EmailPreview email={currentSelected} notify={notify} selectedFbo={selectedFbo} matchingFbos={matchingFbos} setSelectedFbo={id => currentSelected?.type === 'FBO' && setSelectedFboByEmail(prev => ({ ...prev, [currentSelected.id]: id }))} openInFront={openInFront} airnavLoading={airnavLoading} airnavError={airnavError} isUsAirnav={isUsAirnav} /></div>}
    <div className="panel recent"><div className="panelHead"><div><h3><FileText size={18} /> Recently Processed Schedules</h3><p>Schedules currently in your workspace</p></div></div><FlightTable rows={routeInfo.rows.length ? routeInfo.rows.map(r => [r[0], r[1], r[3], r[13], `${r[4] || ''} → ${r[6] || ''}`, r[2], r[11], cleanFboName(r[15] || '') , 'Ready']) : flights} /></div>

  </>
}

function stripHtml(value: string) {
  if (!value) return ''
  const div = typeof document !== 'undefined' ? document.createElement('div') : null
  if (!div) return value.replace(/<[^>]*>/g, '')
  div.innerHTML = value
  return div.textContent || div.innerText || ''
}
function copyRichText(html: string, notify: (s: string) => void, label: string) {
  const plain = stripHtml(html)
  if (navigator.clipboard?.write && typeof ClipboardItem !== 'undefined') {
    navigator.clipboard.write([new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }), 'text/plain': new Blob([plain], { type: 'text/plain' }) })]).then(() => notify(label)).catch(() => navigator.clipboard?.writeText(plain).then(() => notify(label)))
  } else navigator.clipboard?.writeText(plain).then(() => notify(label))
}
function EmailPreview({ email, notify, selectedFbo, matchingFbos, setSelectedFbo, openInFront, airnavLoading, airnavError, isUsAirnav }: { email: Email; notify: (s: string) => void; selectedFbo: FBO | null; matchingFbos: FBO[]; setSelectedFbo: (id: number | null) => void; openInFront: (subject: string, body: string) => void; airnavLoading: boolean; airnavError: string; isUsAirnav: boolean }) {
  const [draftSubject, setDraftSubject] = useState(email.subject)
  const [draftBody, setDraftBody] = useState(email.body)
  const bodyRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    setDraftSubject(email.subject)
    setDraftBody(email.body)
  }, [email.id, email.subject, email.body])

  useEffect(() => {
    if (bodyRef.current && bodyRef.current.innerHTML !== draftBody) bodyRef.current.innerHTML = draftBody
  }, [email.id])

  return <div className="panel emailPreview">
    <div className="previewHead"><h3><Mail size={18} /> Email Preview</h3><span style={{fontSize:8,color:'#7b8b9f'}}>Editable draft</span></div>
    <div className="previewBody">
      {email.type === 'FBO' && <div className="fboComposeBox">
        <div className="fboComposeTitle"><b>FBO Email</b><span>{email.iata ? email.iata + ' / ' + email.icao : email.icao}</span></div>
        <div className="fboComposeGrid">
          <label>FBO at this location<select value={selectedFbo?.id || ''} onChange={e => setSelectedFbo(e.target.value ? Number(e.target.value) : null)}><option value="">Select FBO...</option>{matchingFbos.map(f => <option key={f.id} value={f.id}>{f.name}{f.email ? ' — ' + f.email : ' — Email not listed'}</option>)}</select></label>
          <div className="fboSelectedDetails"><span><b>Source:</b> {isUsAirnav ? 'AirNav' : 'AirNav unavailable for non-U.S. airport'}</span><span><b>Phone:</b> {selectedFbo?.phone || '—'}</span></div>
        </div>
        {airnavLoading && <small className="fieldHint">Looking up available FBOs on AirNav…</small>}
        {airnavError && <small className="fieldHint">{airnavError}</small>}
        {!airnavLoading && !airnavError && !matchingFbos.length && <small className="fieldHint">{isUsAirnav ? 'AirNav did not return any FBO records for this airport.' : 'AirNav FBO lookup is available only for U.S. Kxxx ICAO airports.'}</small>}
      </div>}
      <div className="previewField">
        <div className="previewLabel"><b>To</b></div>
        <div className="copyBox" style={{minHeight:38,display:'flex',alignItems:'center',fontSize:9,color:selectedFbo?.email ? '#263e5a' : '#8a98a9',background:'#f8fafc'}}>
          {email.type === 'FBO' ? (selectedFbo?.email || 'Select an FBO above') : 'Customer email address is not configured'}
        </div>
      </div>
      <div className="previewField">
        <div className="previewLabel"><b>Subject</b></div>
        <input value={stripHtml(draftSubject)} onChange={e => setDraftSubject(e.target.value)} style={{width:'100%',border:'1px solid var(--line)',borderRadius:6,padding:'9px 10px',fontSize:9,background:'#fff',outline:'none'}} />
      </div>
      <div className="previewField bodyField">
        <div className="previewLabel"><b>Email Body</b></div>
        <div ref={bodyRef} className="copyBox bodyBox" contentEditable suppressContentEditableWarning onInput={e => setDraftBody(e.currentTarget.innerHTML)} style={{minHeight:250,outline:'none',cursor:'text'}} />
      </div>
      <div style={{display:'flex',gap:7,marginTop:12}}>
        <button className="secondary" onClick={() => { setDraftSubject(email.subject); setDraftBody(email.body); if (bodyRef.current) bodyRef.current.innerHTML = email.body }}>Reset Draft</button>
        {email.type === 'FBO' && <button className="primary openFrontButton" style={{marginTop:0,flex:1}} onClick={() => openInFront(stripHtml(draftSubject), stripHtml(draftBody))}><Mail size={15} /> Open in Front</button>}
      </div>
    </div>
  </div>
}
function FlightTable({ rows }: { rows: string[][] }) { return <div className="tableWrap"><table><thead><tr>{['Trip #', 'Date', 'Aircraft', 'Client', 'Route', 'ETD', 'ETA', 'FBO', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{j === 8 ? <span className={'status ' + String(c).toLowerCase()}><i />{c}</span> : c}</td>)}<td><button className="tiny"><Mail size={13} /></button><button className="tiny"><FileText size={13} /></button></td></tr>)}</tbody></table></div> }


function parseDateTimeValue(dateValue: string, timeValue: string) {
  const raw = `${String(dateValue || '').trim()} ${String(timeValue || '').trim()}`.trim()
  const parsed = raw ? new Date(raw) : new Date(NaN)
  return Number.isNaN(parsed.getTime()) ? Number.MAX_SAFE_INTEGER : parsed.getTime()
}
function legKey(row: string[]) {
  return [row[0], row[1], row[2], row[3], row[4], row[6], row[10], row[11], row[12], row[13]].map(v => String(v || '').trim().toUpperCase()).join('|')
}
function routePairs(rows: string[][]) {
  return rows.map(r => `${String(r[4] || '').toUpperCase()}→${String(r[6] || '').toUpperCase()}`).filter(x => x !== '→')
}
function buildCommunications(rows: string[][], customers: Customer[], aircraft: Aircraft[], templates: Template[], airports: Airport[] = [], fboSelections: Record<string, number | null> = {}) {
  const errors: string[] = []
  const emails: Email[] = []
  if (!rows.length) return { emails, errors }
  const aircraftByTail = (tail: string) => aircraft.find(a => a.tail.toUpperCase() === String(tail || '').trim().toUpperCase())
  const airportByIcao = (icao: string) => airports.find(a => a.icao.toUpperCase() === String(icao || '').trim().toUpperCase())
  const airportValues = (icao: string) => { const a = airportByIcao(icao); return { IATA: a?.iata || '', AIRPORT_NAME: a?.name || '' } }
  const formatTripLocation = (icao: string) => { const code=String(icao||'').trim().toUpperCase(); const a=airportByIcao(code); if(!a)return code; const city=a.city||a.name||code; const cc=String(a.countryCode||'').trim().toUpperCase(); const state=String(a.state||'').trim().toUpperCase(); return cc==='US'?`${city}${state?`, ${state}`:''} (${a.iata||code})`:`${city}, ${a.countryName||'International'} (${code})` }
  const customerByName = (name: string) => customers.find(c => c.name.toLowerCase() === String(name || '').trim().toLowerCase())
  const first = rows[0], matchedAircraft = aircraftByTail(first[3])
  const customer = (matchedAircraft?.customerId ? customers.find(c=>c.id===matchedAircraft.customerId) : undefined) || customerByName(first[13])
  const customerTemplate = customer ? templates.find(t=>t.type==='Customer' && t.customerIds.includes(customer.id)) : undefined
  // Customer/template matching is a warning only. FBO drafts must remain usable even when the customer is unknown.
  if (!customer) errors.push(`Customer not found: ${String(first[13] || first[3] || 'Unknown').trim()}. FBO drafts can still be created.`)
  else if (!customerTemplate) errors.push(`No customer template assigned to ${customer.name}. You can still proceed with FBO drafts.`)
  if (customer && customerTemplate) {
    const last=rows[rows.length-1], tripNumber=String(first[0]||'').trim(), tail=matchedAircraft?.tail||String(first[3]||'').trim()
    const routeCodes:string[]=[]; for(const r of rows) for(const raw of [r[4],r[6]]) { const c=String(raw||'').trim().toUpperCase(); if(c&&!routeCodes.includes(c)) routeCodes.push(c) }
    const values:Record<string,string>={TRIP_NUMBER:customer.includeTripNumber?tripNumber:'',TAIL:tail,ROUTE:routeCodes.join(' → '),DEPARTURE_DATE:first[1]||'',ETD:first[2]||'',ETA:last[11]||'',FBO:cleanFboName(first[15]||''),AGENT:first[14]||'',CUSTOMER:customer?.name||'',ICAO:String(first[4]||'').toUpperCase(),...airportValues(String(first[4]||'')),DEPARTURE_ICAO:String(first[4]||'').toUpperCase(),ARRIVAL_ICAO:String(last[6]||'').toUpperCase(),DEPARTURE_AIRPORT:first[5]||'',ARRIVAL_AIRPORT:last[7]||'',FT:first[8]||'',CREW:first[9]||'',ARRIVAL_DATE:last[10]||first[1]||'',LEG_NUMBER:first[12]||'',TRIP_LOCATION:routeCodes.map(formatTripLocation).join('<br><br>'),AVCARD:matchedAircraft?.avcard?formatCardForEmail(matchedAircraft.avcard):'',AVCARD_EXPIRATION:matchedAircraft?.expiration||''}
    const tripLine=customer.includeTripNumber&&tripNumber?`Trip Number: ${tripNumber}<br>`:''; let subject=replaceTemplatePlaceholders(customerTemplate.subject,values,tripLine); if(customer.includeTripNumber&&tripNumber&&!stripHtml(subject).trim().endsWith(` - ${tripNumber}`))subject+=` - ${tripNumber}`
    emails.push({id:10000,type:'Customer',icao:String(first[4]||'').toUpperCase(),fbo:cleanFboName(first[15]||''),tail,customer:customer.name,subject,body:replaceTemplatePlaceholders(customerTemplate.body,values,tripLine,matchedAircraft),status:'Ready'})
  }
  const locations=new Map<string,string[]>(); for(const r of rows) for(const raw of [r[4],r[6]]) { const code=String(raw||'').trim().toUpperCase(); if(code&&!locations.has(code))locations.set(code,r) }
  let id=20000
  for(const [code,r] of locations) {
    const tid=fboSelections[code]; const template=tid?templates.find(t=>t.id===tid&&t.type==='FBO'):undefined; if(!template)continue
    const tailAircraft=aircraftByTail(r[3])||matchedAircraft; const tail=tailAircraft?.tail||String(r[3]||'').trim()
    const values:Record<string,string>={TRIP_NUMBER:r[0]||'',TAIL:tail,ROUTE:`${String(r[4]||'').toUpperCase()}${r[6]?` → ${String(r[6]).toUpperCase()}`:''}`,DEPARTURE_DATE:r[1]||'',ETD:r[2]||'',ETA:r[11]||'',FBO:cleanFboName(r[15]||''),AGENT:r[14]||'',CUSTOMER:customer?.name||'',ICAO:code,DEPARTURE_ICAO:String(r[4]||'').toUpperCase(),ARRIVAL_ICAO:String(r[6]||'').toUpperCase(),...airportValues(code),DEPARTURE_AIRPORT:r[5]||'',ARRIVAL_AIRPORT:r[7]||'',FT:r[8]||'',CREW:r[9]||'',ARRIVAL_DATE:r[10]||r[1]||'',ARRIVAL_TIME:r[11]||'',DEPARTURE_DATE_ACTUAL:r[1]||'',DEPARTURE_TIME:r[2]||'',ARRIVAL_MONTH_DAY:formatMonthDay(r[10]||r[1]||''),DEPARTURE_MONTH_DAY:formatMonthDay(r[1]||''),LEG_NUMBER:r[12]||'',AVCARD:tailAircraft?.avcard?formatCardForEmail(tailAircraft.avcard):'',AVCARD_EXPIRATION:tailAircraft?.expiration||''}
    emails.push({id:id++,type:'FBO',icao:code,iata:airportValues(code).IATA,fbo:cleanFboName(r[15]||''),tail,customer:customer?.name||'',subject:replaceTemplatePlaceholders(template.subject,values),body:replaceTemplatePlaceholders(template.body,values,'',tailAircraft),status:'Ready'})
  }
  return {emails,errors:Array.from(new Set(errors))}
}
function formatCardForEmail(value: string) { return value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() }
function formatMonthDay(value: string) {
  const m = String(value || '').match(/(\d{1,2})[\/.-](\d{1,2})/)
  return m ? `${m[1].padStart(2,'0')}/${m[2].padStart(2,'0')}` : String(value || '')
}
function avcardTableHtml(values: Record<string,string>) {
  return `<table style="display:inline-table;border-collapse:collapse;width:max-content;min-width:0;max-width:max-content;table-layout:auto;font-family:Arial,sans-serif;font-size:13px"><tbody><tr><th style="background:#0b3154;color:#fff;padding:6px 8px;border:1px solid #0b3154;text-align:left;white-space:nowrap;width:1%">Tail</th><th style="background:#0b3154;color:#fff;padding:6px 8px;border:1px solid #0b3154;text-align:left;white-space:nowrap;width:1%">AVCARD Number</th><th style="background:#0b3154;color:#fff;padding:6px 8px;border:1px solid #0b3154;text-align:left;white-space:nowrap;width:1%">Expiration Date</th></tr><tr><td style="background:#fff;color:#111;padding:6px 8px;border:1px solid #cfd8e3;white-space:nowrap;width:1%">${values.TAIL || ''}</td><td style="background:#fff;color:#111;padding:6px 8px;border:1px solid #cfd8e3;white-space:nowrap;width:1%">${values.AVCARD || ''}</td><td style="background:#fff;color:#111;padding:6px 8px;border:1px solid #cfd8e3;white-space:nowrap;width:1%">${values.AVCARD_EXPIRATION || ''}</td></tr></tbody></table>`
}
function replaceTemplatePlaceholders(text: string, values: Record<string, string>, tripLine = '', aircraft?: Aircraft) {
  return text.replace(/{{\s*([A-Z0-9_]+)\s*}}/g, (_, key) => key === 'TRIP_NUMBER_LINE' ? tripLine : key === 'AVCARD_TABLE' ? avcardTableHtml(values) : (values[key] ?? ''))
}

function ScheduleProcessor({ schedule, setSchedule, notify, deals, customers, aircraft, templates, setGeneratedEmails, setPage }: { schedule: string; setSchedule: (s: string) => void; notify: (s: string) => void; deals: Deal[]; customers: Customer[]; aircraft: Aircraft[]; templates: Template[]; setGeneratedEmails: (e: Email[]) => void; setPage: (p: Page) => void }) {
  const sample='1024\t09/17/2026\t08:30\tN123AB\tKMIA\tMiami\tKTEB\tTeterboro\t02:45\t3\t09/17/2026\t11:15\t1\tABC Aviation\tJohn Smith\tPVD - Signature Aviation 305-555-1212\n1025\t09/17/2026\t13:00\tN123AB\tKTEB\tTeterboro\tKMIA\tMiami\t02:55\t3\t09/17/2026\t15:55\t2\tABC Aviation\tJohn Smith\tSignature Aviation'
  const rows=parseSchedule(schedule).rows; const [step,setStep]=useState<1|2>(1); const [previewId,setPreviewId]=useState<number|null>(null); const [reviewTab,setReviewTab]=useState<'Customer'|'FBO'>('Customer'); const [fboSelections,setFboSelections]=useState<Record<string,number|null>>({}); const [removed,setRemoved]=useState<Set<string>>(new Set()); const [ready,setReady]=useState<Set<string>>(new Set())
  const matchedAircraft=aircraft.find(a=>rows[0]?.[3]&&a.tail.toUpperCase()===String(rows[0][3]).trim().toUpperCase()); const customer=(matchedAircraft?.customerId?customers.find(c=>c.id===matchedAircraft.customerId):undefined)||customers.find(c=>c.name.toLowerCase()===(rows[0]?.[13]||'').trim().toLowerCase()); const customerTemplate=customer ? templates.find(t=>t.type==='Customer' && t.customerIds.includes(customer.id)) : undefined
  const codes=useMemo(()=>Array.from(new Set(rows.flatMap(r=>[r[4],r[6]].filter(Boolean).map(v=>String(v).trim().toUpperCase())))),[rows]); const [airportData,setAirportData]=useState<Airport[]>([])
  useEffect(()=>{if(!codes.length){setAirportData([]);return};const controller=new AbortController();fetch(`/api/airports?icaos=${encodeURIComponent(codes.join(','))}`,{signal:controller.signal}).then(r=>r.ok?r.json():{rows:[]}).then(d=>setAirportData((d.rows||[]) as Airport[])).catch(()=>{});return()=>controller.abort()},[codes.join(',')])
  const locations=useMemo(()=>{const m=new Map<string,string[]>();for(const r of rows)for(const raw of [r[4],r[6]]){const c=String(raw||'').trim().toUpperCase();if(c&&!m.has(c))m.set(c,r)}return Array.from(m.entries()).map(([icao,row])=>({icao,row}))},[rows]); const fboTemplates=templates.filter(t=>t.type==='FBO'); const customerDeals=customer?deals.filter(d=>customer.dealIds.includes(d.id)):[]
  const options=(icao:string)=>{const selected=fboSelections[icao];const base=customer ? fboTemplates.filter(t=>t.dealIds.length===0||t.dealIds.some(id=>customerDeals.some(d=>d.id===id))) : fboTemplates;return selected&&!base.some(t=>t.id===selected)?[...base,...fboTemplates.filter(t=>t.id===selected)]:base}
  const result=useMemo(()=>buildCommunications(rows,customers,aircraft,templates,airportData,fboSelections),[rows,customers,aircraft,templates,airportData,JSON.stringify(fboSelections)]); const errors=result.errors; const communications=result.emails.filter(e=>e.type==='Customer'||!removed.has(e.icao)); const visible=locations.filter(x=>!removed.has(x.icao))
  function reset(){setFboSelections({});setRemoved(new Set());setReady(new Set());setGeneratedEmails([])}; function loadSample(){setSchedule(sample);setStep(1);reset()}; function next(){if(!rows.length)return notify('Paste one schedule first');setStep(2)}; function back(){setStep(1)}
  function choose(icao:string,id:number){setFboSelections(s=>({...s,[icao]:id}));setReady(s=>new Set([...s,icao]))}; function discard(icao:string){setRemoved(s=>new Set([...s,icao]));setReady(s=>{const n=new Set(s);n.delete(icao);return n})}
  const missingFboTemplate=visible.find(x=>!fboSelections[x.icao])
  const allFboTemplatesSelected=visible.length===0||!missingFboTemplate
  function confirm(){
    if(!allFboTemplatesSelected){
      setReviewTab('FBO')
      return notify('Select an FBO template for every location, or discard that location, before continuing')
    }
    const customerEmail=communications.find(e=>e.type==='Customer')
    const fbos=communications.filter(e=>e.type==='FBO')
    if(!customerEmail&&!fbos.length)return notify('Select at least one FBO template or configure a customer template')
    setGeneratedEmails([...(customerEmail?[customerEmail]:[]),...fbos])
    setPage('Dashboard')
    notify(customerEmail?'Emails generated and sent to Dashboard':'FBO emails generated and sent to Dashboard')
  }
  return <div className="panel processor"><div className="steps"><span className="done">1 <b>Paste Schedule</b></span><span className={step===2?'done':''}>2 <b>Build Emails</b></span></div>
    {step===1&&<><div className="drop"><div className="excel">X</div><b>Copy one customer schedule from Excel and paste it here...</b><small>One schedule at a time. The tool creates one Customer email and an FBO draft for every unique location.</small><textarea value={schedule} onChange={e=>{setSchedule(e.target.value);reset();setStep(1)}} placeholder="Paste tab-separated Excel rows here..."/><div><button className="secondary" onClick={loadSample}><ClipboardList size={15}/> Load sample</button><span>or paste directly into the box</span></div></div>{rows.length>0&&<><div className="detect"><h3>Schedule ready ({rows.length} rows)</h3><span><CheckCircle2 size={16}/> One schedule / one customer</span></div><div className="tableWrap"><table><thead><tr>{SCHEDULE_COLUMNS.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{rows.slice(0,8).map((r,i)=><tr key={i}>{Array.from({length:16},(_,j)=><td key={j}>{r[j]||'—'}</td>)}</tr>)}</tbody></table></div><div className="stepActions"><button className="primary" onClick={next}>Next: Build Emails <ChevronRight size={15}/></button></div></>}</>}
    {step===2&&<><div className="reviewSummary"><div><b>Customer</b><span>{customer?.name||'Not found'}</span></div><div><b>Customer Emails</b><span>1</span></div><div><b>FBO Locations</b><span>{visible.length}</span></div><div><b>FBOs Selected</b><span>{visible.filter(x=>fboSelections[x.icao]).length}</span></div></div>{errors.length>0&&<div className="validationError"><AlertTriangle size={18}/><div><b>Setup required</b>{errors.map((e,i)=><p key={i}>{e}</p>)}</div></div>}
      <div className="tabs"><button className={reviewTab==='Customer'?'tab active':'tab'} onClick={()=>setReviewTab('Customer')}><Mail size={15}/> Customer Email (1)</button><button className={reviewTab==='FBO'?'tab active':'tab'} onClick={()=>setReviewTab('FBO')}><Mail size={15}/> FBO Emails ({visible.length})</button></div>{reviewTab==='Customer'&&<div className="tripReview"><div className="tripReviewHead"><div><h3>Customer Email</h3><p>{customerTemplate ? 'Exactly one customer email is generated for the pasted schedule.' : 'No customer email is available for this schedule. You can still proceed with FBO emails.'}</p></div></div><div className="reviewEmails">{communications.filter(e=>e.type==='Customer').map(e=><div className="reviewEmailCard" key={e.id}><div><span className="pill">CUSTOMER</span><h3>{e.customer}</h3><p><b>Subject:</b> {e.subject}</p></div><button className="secondary" onClick={()=>setPreviewId(previewId===e.id?null:e.id)}><Mail size={14}/> {previewId===e.id?'Hide Preview':'Preview'}</button>{previewId===e.id&&<EmailReviewContent email={e} notify={notify}/>}</div>)}</div></div>}
      {reviewTab==='FBO'&&<div className="tripReview"><div className="tripReviewHead"><div><h3>FBO Emails</h3><p>Every location is included initially, including the starting location. Select the deal/template, check it when ready, or discard it.</p></div></div><div className="tripReviewList">{visible.map(({icao,row})=>{const opts=options(icao);const selected=fboSelections[icao]||'';const airport=airportData.find(a=>a.icao===icao);return <div className="tripReviewCard" key={icao}><div className="tripReviewTop"><div><span className="pill">FBO</span><h3>{airport?.city||row[7]||row[5]||icao} <small>({icao})</small></h3><p>{cleanFboName(row[15]||'')||'FBO not specified'} · {customer?.name||'Customer not found'}</p></div><div style={{display:'flex',gap:8}}><button className={ready.has(icao)?'primary':'secondary'} title="Mark ready" onClick={()=>selected?setReady(s=>new Set([...s,icao])):notify('Select an FBO template first')}><Check size={15}/></button><button className="secondary" title="Discard location" onClick={()=>discard(icao)}><Trash2 size={15}/></button></div></div><div className="formGrid"><label className="wide">Which template should we use for this FBO?<select value={selected} onChange={e=>choose(icao,Number(e.target.value))}><option value="">Select template...</option>{opts.map(t=><option key={t.id} value={t.id}>{t.name}{t.dealIds.length?` — ${t.dealIds.map(id=>deals.find(d=>d.id===id)?.provider||'').filter(Boolean).join(', ')}`:' — General'}</option>)}</select>{!opts.length&&<small>No FBO templates are available yet. Create one under Templates, then return here.</small>}</label></div></div>})}</div></div>}
      {reviewTab==='FBO'&&<div className="reviewEmails"><h3 style={{margin:'4px 0 10px'}}>FBO Previews</h3>{communications.filter(e=>e.type==='FBO').map(e=><div className="reviewEmailCard" key={e.id}><div><span className="pill">FBO</span><h3>{e.icao} – {e.fbo||'FBO'}</h3><p><b>Subject:</b> {e.subject}</p></div><button className="secondary" onClick={()=>setPreviewId(previewId===e.id?null:e.id)}><Mail size={14}/> {previewId===e.id?'Hide Preview':'Preview'}</button>{previewId===e.id&&<EmailReviewContent email={e} notify={notify}/>}</div>)}</div>}
      <div className="stepActions"><button className="secondary" onClick={back}>Back</button><button className="primary" onClick={confirm} disabled={!allFboTemplatesSelected}>Confirm & Go to Dashboard <ChevronRight size={15}/></button></div></>}
  </div>
}
function EmailReviewContent({email,notify}:{email:Email;notify:(s:string)=>void}){return <div className="reviewPreview"><div className="reviewCopyField"><div><b>Subject</b><button className="copyBoxButton" onClick={()=>copyRichText(email.subject,notify,'Subject copied')}><Copy size={12}/> Copy</button></div><div className="copyBox" dangerouslySetInnerHTML={{__html:email.subject}}/></div><div className="reviewCopyField"><div><b>Email Body</b><button className="copyBoxButton" onClick={()=>copyRichText(email.body,notify,'Email body copied')}><Copy size={12}/> Copy</button></div><div className="copyBox bodyBox" dangerouslySetInnerHTML={{__html:email.body}}/></div></div>}

function CustomerDeals({ deals, setDeals, notify }: { deals: Deal[]; setDeals: (d: Deal[]) => void; notify: (s: string) => void }) {
  const [editing, setEditing] = useState<Deal | null>(null); const [editorOpen, setEditorOpen] = useState(false); const [name, setName] = useState(''); const [provider, setProvider] = useState(''); const [description, setDescription] = useState(''); const [color, setColor] = useState('#1976e5'); const [tankering, setTankering] = useState(false)
  function open(d?: Deal) { setEditorOpen(true); setEditing(d || null); setName(d?.name || ''); setProvider(d?.provider || ''); setDescription(d?.description || ''); setColor(d?.color || '#1976e5'); setTankering(d?.tankering || false) }
  function close() { setEditing(null); setEditorOpen(false); setName(''); setProvider(''); setDescription(''); setColor('#1976e5'); setTankering(false) }
  function save() { if (!name.trim() || !provider.trim()) return notify('Deal name and provider are required'); const item = { id: editing?.id || Date.now(), name: name.trim(), provider: provider.trim(), description: description.trim(), color, tankering }; setDeals(editing ? deals.map(d => d.id === editing.id ? item : d) : [...deals, item]); notify(editing ? 'Deal updated' : 'Deal created'); close() }
  function remove(id: number) { setDeals(deals.filter(d => d.id !== id)); notify('Deal deleted') }
  return <div className="panel full"><div className="sectionIntro"><div><h3>Customer Deals</h3><p>Create pricing programs here, then assign any combination to each customer.</p></div><button className="primary" onClick={() => open()}><Plus size={16} /> Add Deal</button></div><div className="dealGrid">{deals.map(d => <div className="dealCard" key={d.id} style={{ borderTopColor: d.color }}><div className="dealBadge" style={{ background: `${d.color}18`, color: d.color, border: `1px solid ${d.color}40` }}>{d.provider.slice(0, 2).toUpperCase()}</div><div><h3>{d.name}</h3><b style={{ color: d.color }}>{d.provider}</b><p>{d.description}</p><div className="dealMeta"><span style={{ color: d.tankering ? '#0b9c63' : '#8a97a7' }}>{d.tankering ? 'Tankering enabled' : 'Tankering not included'}</span></div></div><div className="cardActions"><button onClick={() => open(d)}><Edit3 size={14} /> Edit</button><button onClick={() => remove(d.id)}><Trash2 size={14} /> Delete</button></div></div>)}</div>{editorOpen && <div className="editor"><h3>{editing ? 'Edit Customer Deal' : 'New Customer Deal'}</h3><div className="formGrid"><label>Deal name<input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. CAA Network Pricing" /></label><label>Provider / program<input value={provider} onChange={e => setProvider(e.target.value)} placeholder="e.g. CAA" /></label><label>Deal color<div className="colorPicker"><input type="color" value={color} onChange={e => setColor(e.target.value)} /><span style={{ background: color }}></span><b>{color.toUpperCase()}</b></div></label><label className="checkField"><input type="checkbox" checked={tankering} onChange={e => setTankering(e.target.checked)} /> Tankering included in this deal</label><label className="wide">Description<textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what this deal provides..." /></label></div><div className="formActions"><button className="secondary" onClick={close}>Cancel</button><button className="primary" onClick={save}><Check size={15} /> Save Deal</button></div></div>}</div>
}

function Customers({ customers, setCustomers, deals, notify }: { customers: Customer[]; setCustomers: (c: Customer[]) => void; deals: Deal[]; notify: (s: string) => void }) {
  const [editing, setEditing] = useState<Customer | null>(null); const [editorOpen, setEditorOpen] = useState(false); const [name, setName] = useState(''); const [dealIds, setDealIds] = useState<number[]>([]); const [rule, setRule] = useState('Customer + FBO emails'); const [includeTripNumber, setIncludeTripNumber] = useState(false); const [homeBase, setHomeBase] = useState('')
  function open(c?: Customer) { setEditorOpen(true); setEditing(c || null); setName(c?.name || ''); setDealIds(c?.dealIds || []); setRule(c?.rule || 'Customer + FBO emails'); setIncludeTripNumber(c?.includeTripNumber ?? false); setHomeBase(c?.homeBase || '') }
  function close() { setEditing(null); setEditorOpen(false); setName(''); setDealIds([]); setRule('Customer + FBO emails'); setIncludeTripNumber(false); setHomeBase('') }
  function save() { if (!name.trim()) return notify('Customer name is required'); const normalizedHomeBase = homeBase.trim().toUpperCase(); if (!/^[A-Z]{4}$/.test(normalizedHomeBase)) return notify('Home base location must be a 4-letter ICAO code'); const item: Customer = { id: editing?.id || Date.now(), name: name.trim(), dealIds, rule, includeTripNumber, homeBase: normalizedHomeBase }; setCustomers(editing ? customers.map(c => c.id === editing.id ? item : c) : [...customers, item]); notify(editing ? 'Customer updated' : 'Customer created'); close() }
  return <div className="panel full"><div className="sectionIntro"><div><h3>Customers</h3><p>Customers are assigned to the Customer Deals created in the pricing-program library.</p></div><button className="primary" onClick={() => open()}><Plus size={16} /> Add Customer</button></div><div className="tableWrap"><table><thead><tr><th>Customer Name</th><th>Customer Deals</th><th>Trip Number</th><th>Home Base Location</th><th>Actions</th></tr></thead><tbody>{customers.map(c => <tr key={c.id}><td><b>{c.name}</b></td><td>{deals.filter(d => c.dealIds.includes(d.id)).map(d => <span className="pill" key={d.id} style={{ background: `${d.color}18`, color: d.color, border: `1px solid ${d.color}35` }}>{d.provider}</span>)}{c.dealIds.length === 0 && <span className="mutedText">No deals assigned</span>}</td><td><span className={c.includeTripNumber ? 'yes' : 'no'}>{c.includeTripNumber ? 'Included' : 'Not included'}</span></td><td><b>{c.homeBase || '—'}</b></td><td><button className="tiny" onClick={() => open(c)}><Edit3 size={13} /></button></td></tr>)}</tbody></table></div>{editorOpen && <div className="editor"><h3>{editing ? 'Edit Customer' : 'New Customer'}</h3><div className="formGrid"><label>Customer name<input value={name} onChange={e => setName(e.target.value)} placeholder="Customer name" /></label><label>Communication rules<select value={rule} onChange={e => setRule(e.target.value)}><option>Customer + FBO emails</option><option>Customer email only</option><option>Full fuel communication</option><option>Custom template</option></select></label><label>Home base location<input value={homeBase} maxLength={4} onChange={e => setHomeBase(e.target.value.replace(/[^a-zA-Z]/g, '').slice(0,4).toUpperCase())} placeholder="KTEB" /><small>4-letter ICAO airport identifier</small></label><label className="checkField"><input type="checkbox" checked={includeTripNumber} onChange={e => setIncludeTripNumber(e.target.checked)} /> Include Trip Number in customer emails</label><div className="wide"><b className="labelTitle">Customer Deals</b><p className="fieldHint">Select every pricing program this customer has.</p><div className="dealChecks">{deals.map(d => <label key={d.id} style={{ borderLeftColor: d.color }}><input type="checkbox" checked={dealIds.includes(d.id)} onChange={e => setDealIds(e.target.checked ? [...dealIds, d.id] : dealIds.filter(id => id !== d.id))} /><span style={{ color: d.color }}>{d.name}</span><small>{d.provider}</small></label>)}</div></div></div><div className="formActions"><button className="secondary" onClick={close}>Cancel</button><button className="primary" onClick={save}><Check size={15} /> Save Customer</button></div></div>}</div>
}

function Toolbar({ placeholder }: { placeholder: string }) { return <div className="toolbar"><div><Search size={14} /><input placeholder={placeholder} /></div><button className="viewBtn">☷</button><button className="viewBtn">▦</button></div> }

function AircraftPage({ aircraft, setAircraft, customers, notify }: { aircraft: Aircraft[]; setAircraft: (a: Aircraft[]) => void; customers: Customer[]; deals: Deal[]; notify: (s: string) => void }) {
  const [editing, setEditing] = useState<Aircraft | null>(null); const [editorOpen, setEditorOpen] = useState(false); const [tail, setTail] = useState(''); const [type, setType] = useState(''); const [customerId, setCustomerId] = useState<number | null>(null); const [homeBase, setHomeBase] = useState(''); const [avcard, setAvcard] = useState(''); const [expiration, setExpiration] = useState('');
  function open(a?: Aircraft) { setEditorOpen(true); setEditing(a || null); setTail(a?.tail || ''); setType(a?.type || ''); setCustomerId(a?.customerId ?? null); setHomeBase(a?.homeBase || ''); setAvcard(a?.avcard || ''); setExpiration(a?.expiration || '') }
  function close() { setEditing(null); setEditorOpen(false); setTail(''); setType(''); setCustomerId(null); setHomeBase(''); setAvcard(''); setExpiration('') }
  function save() { const cardDigits = avcard.replace(/\s/g, ''); if (!tail.trim() || !type.trim()) return notify('Tail number and aircraft type are required'); if (cardDigits && cardDigits.length !== 16) return notify('AVCARD must contain exactly 16 digits'); if (expiration && !/^((0[1-9])|(1[0-2]))\/(20\d{2})$/.test(expiration)) return notify('Expiration must be MM/YYYY'); const item: Aircraft = { id: editing?.id || Date.now(), tail: tail.trim().toUpperCase(), type: type.trim(), customerId, homeBase: homeBase.trim().toUpperCase(), avcard: cardDigits, expiration: expiration.trim(), active: editing?.active ?? true }; if (editing) setAircraft(aircraft.map(a => a.id === editing.id ? item : a)); else setAircraft([...aircraft, item]); notify(editing ? 'Aircraft updated' : 'Aircraft added'); close() }
  function toggleStatus(id: number) { setAircraft(aircraft.map(a => a.id === id ? { ...a, active: !a.active } : a)); notify('Aircraft status updated') }
  function remove(id: number) { setAircraft(aircraft.filter(a => a.id !== id)); notify('Aircraft removed') }
  function formatCard(value: string) { return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim() }
  function formatExpiration(value: string) { const digits = value.replace(/\D/g, '').slice(0, 6); return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits }
  function handleCardChange(value: string) { setAvcard(formatCard(value)) }
  function handleMonthChange(value: string) { const month = value.replace(/\D/g, '').slice(0, 2); setExpiration(`${month}${expiration.includes('/') ? expiration.slice(expiration.indexOf('/')) : ''}`) }
  function handleYearChange(value: string) { const year = value.replace(/\D/g, '').slice(0, 4); const month = expiration.split('/')[0] || ''; setExpiration(month ? `${month}/${year}` : year) }
  return <div className="panel full aircraftPage"><div className="sectionIntro"><div><h3>Aircraft</h3><p>Manage tail numbers, ownership, home base, AVCARD details and status.</p></div><button className="primary" onClick={() => open()}><Plus size={16} /> Add Aircraft</button></div><Toolbar placeholder="Search aircraft..." /><div className="tableWrap"><table><thead><tr>{['Tail','Aircraft Type','Customer','Home Base','AVCARD Number','Expiration Date','Status','Actions'].map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{aircraft.map(a => <tr key={a.id}><td><b>{a.tail}</b></td><td>{a.type}</td><td>{customers.find(c => c.id === a.customerId)?.name || 'Unassigned'}</td><td>{a.homeBase || '—'}</td><td><div className="aircraftCardDisplay"><img src="/avcard-card.jpg" alt="AVCARD by World Fuel" className="aircraftCardThumb" /><span className="cardNumber">{formatCard(a.avcard) || '—'}</span></div></td><td>{a.expiration || '—'}</td><td><button className={a.active ? 'statusButton active' : 'statusButton inactive'} onClick={() => toggleStatus(a.id)}><i />{a.active ? 'Active' : 'Inactive'}</button></td><td><button className="tiny" onClick={() => open(a)}><Edit3 size={13} /></button><button className="tiny" onClick={() => remove(a.id)}><Trash2 size={13} /></button></td></tr>)}</tbody></table></div>{editorOpen && <div className="editor"><h3>{editing ? 'Edit Aircraft' : 'Add Aircraft'}</h3><div className="formGrid"><label>Tail<input value={tail} onChange={e => setTail(e.target.value)} placeholder="N123AB" /></label><label>Aircraft type<input value={type} onChange={e => setType(e.target.value)} placeholder="Gulfstream G650" /></label><label>Customer<select value={customerId ?? ''} onChange={e => setCustomerId(e.target.value ? Number(e.target.value) : null)}><option value="">Unassigned</option>{customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label><label>Home base<input value={homeBase} onChange={e => setHomeBase(e.target.value)} placeholder="KTEB" /></label><label className="wide cardField">AVCARD number<div className="cardInput"><span>••••</span><input inputMode="numeric" maxLength={19} value={formatCard(avcard)} onChange={e => handleCardChange(e.target.value)} placeholder="1234 5678 9012 3456" /><span className="cardMark">AVCARD</span></div><small>16-digit card number · spaces are added automatically</small></label><div className="expiryGroup"><span className="fieldTitle">Expiration date</span><div><label>Month<select value={expiration.split('/')[0] || ''} onChange={e => handleMonthChange(e.target.value)}><option value="">MM</option>{Array.from({length:12},(_,i)=>String(i+1).padStart(2,'0')).map(m => <option key={m} value={m}>{m}</option>)}</select></label><label>Year<select value={expiration.split('/')[1] || ''} onChange={e => handleYearChange(e.target.value)}><option value="">YYYY</option>{Array.from({length:12},(_,i)=>String(new Date().getFullYear()+i)).map(y => <option key={y} value={y}>{y}</option>)}</select></label></div><small>Stored as MM/YYYY</small></div></div><div className="formActions"><button className="secondary" onClick={close}>Cancel</button><button className="primary" onClick={save}><Check size={15} /> Save Aircraft</button></div></div>}</div>
}
const TEMPLATE_PLACEHOLDERS = ['TAIL','ROUTE','DEPARTURE_DATE','TRIP_NUMBER','ETD','ETA','FBO','AGENT','ICAO','IATA','AIRPORT_NAME','CUSTOMER','ARRIVAL_MONTH_DAY','ARRIVAL_TIME','DEPARTURE_MONTH_DAY','DEPARTURE_TIME','DEPARTURE_ICAO','ARRIVAL_ICAO','ARRIVAL_AIRPORT','TRIP_NUMBER_LINE','TRIP_LOCATION']
function RichEditor({ value, onChange, multiline, placeholder, allowTable, notify }: { value: string; onChange: (v: string) => void; multiline?: boolean; placeholder?: string; allowTable?: boolean; notify: (s: string) => void }) {
  const ref = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => { if (ref.current && ref.current.innerHTML !== value) ref.current.innerHTML = value }, [value])
  function command(cmd: string, arg?: string) { ref.current?.focus(); document.execCommand(cmd, false, arg); onChange(ref.current?.innerHTML || '') }
  function addPlaceholder(key: string) { command('insertText', `{{${key}}}`) }
  function addTable() { command('insertText', '{{AVCARD_TABLE}}'); notify('AVCARD table placeholder inserted') }
  function changeColor(color: string) { if (color) command('foreColor', color) }
  function changeSize(size: string) { if (size) command('fontSize', size) }
  return <div className="richEditor"><div className="richToolbar">
    <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => command('bold')}><b>B</b></button>
    <select className="formatSelect" defaultValue="" aria-label="Text color" onMouseDown={e => e.stopPropagation()} onChange={e => { changeColor(e.target.value); e.currentTarget.value = '' }}>
      <option value="">Color</option><option value="#111827">Black</option><option value="#1d4ed8">Blue</option><option value="#0f766e">Teal</option><option value="#b91c1c">Red</option><option value="#6d28d9">Purple</option>
    </select>
    <select className="formatSelect" defaultValue="" aria-label="Text size" onMouseDown={e => e.stopPropagation()} onChange={e => { changeSize(e.target.value); e.currentTarget.value = '' }}>
      <option value="">Size</option><option value="2">Small</option><option value="3">Normal</option><option value="4">Large</option><option value="5">XL</option>
    </select>
    <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => command('backColor', '#fff19a')}>Highlight</button>
    {allowTable && <button type="button" onMouseDown={e => e.preventDefault()} onClick={addTable}>+ AVCARD Table</button>}
    {TEMPLATE_PLACEHOLDERS.map(key => <button key={key} type="button" className="placeholderBtn" onMouseDown={e => e.preventDefault()} onClick={() => addPlaceholder(key)}>{key}</button>)}
  </div><div ref={ref} className={'richContent ' + (multiline ? 'multiline' : '')} contentEditable suppressContentEditableWarning data-placeholder={placeholder || ''} onInput={e => onChange(e.currentTarget.innerHTML)} /> </div>
}
function Templates({ templates, setTemplates, customers, deals, notify }: { templates: Template[]; setTemplates: (t: Template[]) => void; customers: Customer[]; deals: Deal[]; notify: (s: string) => void }) {
  const [editing, setEditing] = useState<Template | null>(null); const [open, setOpen] = useState(false)
  const [name, setName] = useState(''); const [type, setType] = useState<'Customer' | 'FBO'>('Customer'); const [customerIds, setCustomerIds] = useState<number[]>([]); const [dealIds, setDealIds] = useState<number[]>([]); const [subject, setSubject] = useState(''); const [body, setBody] = useState('')
  const selectAllCustomersRef = React.useRef<HTMLInputElement>(null)
  const customerSubject = 'Fuel Reservation – {{TAIL}} – {{ROUTE}} – {{DEPARTURE_DATE}}'
  const customerBody = '<p>Hello {{CUSTOMER}},</p><p>Please review the fuel reservation for {{TAIL}}.</p><p>{{TRIP_NUMBER_LINE}}Route: {{ROUTE}}<br>Departure Date: {{DEPARTURE_DATE}}<br>ETD: {{ETD}}<br>ETA: {{ETA}}<br>FBO: {{FBO}}<br>Agent: {{AGENT}}</p><p>Best regards,<br>World Fuel Services<br>Corporate Fuel Management</p>'
  const fboSubject = 'Handling Request – {{TAIL}} – {{ICAO}} – {{ARRIVAL_MONTH_DAY}}'
  const fboBody = '<p>We have <b>{{TAIL}}</b> (<b>{{DEPARTURE_ICAO}}</b>/<b>{{ARRIVAL_ICAO}}</b>) coming to <b>{{ARRIVAL_AIRPORT}}</b>/<b>{{ICAO}}</b> on <b>{{ARRIVAL_MONTH_DAY}} at {{ARRIVAL_TIME}} lcl</b> and departing <b>{{DEPARTURE_MONTH_DAY}} at {{DEPARTURE_TIME}} lcl</b>. Times are subject to change. <b>{{CUSTOMER}}&apos;s Dispatch Team</b> will contact you directly to provide trip timing, changes, or any services they require.</p>'
  function openEditor(t?: Template) { setEditing(t || null); setName(t?.name || ''); setType(t?.type || 'Customer'); setCustomerIds(t?.customerIds || []); setDealIds(t?.dealIds || []); setSubject(t?.subject || (t?.type === 'FBO' ? fboSubject : customerSubject)); setBody(t?.body || (t?.type === 'FBO' ? fboBody : customerBody)); setOpen(true) }
  function close() { setOpen(false); setEditing(null); setName(''); setType('Customer'); setCustomerIds([]); setDealIds([]); setSubject(''); setBody('') }
  function save() { if (!name.trim() || !stripHtml(subject).trim() || !stripHtml(body).trim()) return notify('Template name, subject and body are required'); if (type === 'Customer' && customerIds.length === 0) return notify('Select at least one customer for a customer template'); const item: Template = { id: editing?.id || Date.now(), name: name.trim(), type, customerIds: type === 'Customer' ? customerIds : [], dealIds: type === 'FBO' ? dealIds : [], subject, body, updated: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }; setTemplates(editing ? templates.map(t => t.id === editing.id ? item : t) : [...templates, item]); notify(editing ? 'Template updated' : 'Template added'); close() }
  const allCustomersSelected = customers.length > 0 && customerIds.length === customers.length
  const someCustomersSelected = customerIds.length > 0 && customerIds.length < customers.length
  useEffect(() => {
    if (selectAllCustomersRef.current) {
      selectAllCustomersRef.current.indeterminate = someCustomersSelected
    }
  }, [someCustomersSelected, open, type])

  function toggleCustomer(id: number) { setCustomerIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]) }
  function selectAllCustomers() { setCustomerIds(customers.map(c => c.id)) }
  function unselectAllCustomers() { setCustomerIds([]) }
  function remove(id: number) { setTemplates(templates.filter(t => t.id !== id)); notify('Template removed') }
  return <div className="panel full"><div className="sectionIntro"><div><h3>Email Templates</h3><p>Build reusable emails with formatting, schedule placeholders, and optional AVCARD tables.</p></div><button className="primary" onClick={() => openEditor()}><Plus size={16} /> New Template</button></div><div className="templateSections"><section><h4>FBO Templates</h4><div className="tableWrap"><table><thead><tr><th>Template Name</th><th>Subject</th><th>Last Updated</th><th>Actions</th></tr></thead><tbody>{templates.filter(t => t.type === 'FBO').map(t => <tr key={t.id}><td><b>{t.name}</b></td><td>{stripHtml(t.subject)}</td><td>{t.updated}</td><td><button className="tiny" onClick={() => openEditor(t)}><Edit3 size={13}/></button><button className="tiny" onClick={() => remove(t.id)}><Trash2 size={13}/></button></td></tr>)}</tbody></table></div></section><section><h4>Customer Templates</h4><div className="tableWrap"><table><thead><tr><th>Template Name</th><th>Customers Using Template</th><th>Subject</th><th>Last Updated</th><th>Actions</th></tr></thead><tbody>{templates.filter(t => t.type === 'Customer').map(t => <tr key={t.id}><td><b>{t.name}</b></td><td>{t.customerIds.map(id => customers.find(c => c.id === id)?.name).filter(Boolean).join(', ') || 'All customers'}</td><td>{stripHtml(t.subject)}</td><td>{t.updated}</td><td><button className="tiny" onClick={() => openEditor(t)}><Edit3 size={13}/></button><button className="tiny" onClick={() => remove(t.id)}><Trash2 size={13}/></button></td></tr>)}</tbody></table></div></section></div><div className="placeholderGuide"><b>Placeholders</b><span>{'{{TAIL}}'}</span><span>{'{{ROUTE}}'}</span><span>{'{{DEPARTURE_DATE}}'}</span><span>{'{{TRIP_NUMBER}}'}</span><span>{'{{ETD}}'}</span><span>{'{{ETA}}'}</span><span>{'{{FBO}}'}</span><span>{'{{AGENT}}'}</span><span>{'{{ICAO}}'}</span><span>{'{{CUSTOMER}}'}</span><span>{'{{ARRIVAL_MONTH_DAY}}'}</span><span>{'{{ARRIVAL_TIME}}'}</span><span>{'{{DEPARTURE_MONTH_DAY}}'}</span><span>{'{{DEPARTURE_TIME}}'}</span><span>{'{{AVCARD_TABLE}}'}</span><small>{'{{AVCARD_TABLE}}'} inserts a formatted 3-column AVCARD information table wherever you place it in the email body.</small></div>{open && <div className="editor"><h3>{editing ? 'Edit Template' : 'Add Template'}</h3><div className="formGrid"><label>Template name<input value={name} onChange={e => setName(e.target.value)} placeholder="ABC Fuel Reservation" /></label><label>Type<select value={type} onChange={e => { const next = e.target.value as 'Customer' | 'FBO'; setType(next); if (!editing) { setSubject(next === 'Customer' ? customerSubject : fboSubject); setBody(next === 'Customer' ? customerBody : fboBody) } }}><option value="Customer">Customer</option><option value="FBO">FBO</option></select></label>{type === 'Customer' && <div className="wide"><span className="labelTitle">Customers using this template</span><div className="customerSelectionTools"><label className="selectAllCustomers"><input ref={selectAllCustomersRef} type="checkbox" checked={allCustomersSelected} onChange={() => allCustomersSelected ? unselectAllCustomers() : selectAllCustomers()} /><span>Select All Customers</span><small>{allCustomersSelected ? 'All customers selected. Uncheck individual customers below to exclude them.' : someCustomersSelected ? customerIds.length + ' customer' + (customerIds.length === 1 ? '' : 's') + ' selected.' : 'No customers selected.'}</small></label><button type="button" className="secondary unselectAllButton" onClick={unselectAllCustomers}>Unselect All</button></div><div className="dealChecks">{customers.map(c => <label key={c.id}><input type="checkbox" checked={customerIds.includes(c.id)} onChange={() => toggleCustomer(c.id)}/><span>{c.name}</span><small>{c.includeTripNumber ? 'Trip Number included' : 'Trip Number not included'}</small></label>)}</div></div>}{type === 'FBO' && <div className="wide"><span className="labelTitle">Deals using this FBO template</span><p className="fieldHint">Assign this template to one or more customer deals. Leave empty for a general FBO template.</p><div className="dealChecks">{deals.map(d => <label key={d.id} style={{borderLeftColor:d.color}}><input type="checkbox" checked={dealIds.includes(d.id)} onChange={()=>setDealIds(ids=>ids.includes(d.id)?ids.filter(x=>x!==d.id):[...ids,d.id])}/><span style={{color:d.color}}>{d.name}</span><small>{d.provider}</small></label>)}</div></div>}<div className="wide"><label>Subject</label><RichEditor value={subject} onChange={setSubject} placeholder={customerSubject} notify={notify}/></div><div className="wide"><label>Template body</label><RichEditor value={body} onChange={setBody} multiline allowTable={type === 'Customer' || type === 'FBO'} placeholder="Write the email template here..." notify={notify}/></div></div><div className="formActions"><button className="secondary" onClick={close}>Cancel</button><button className="primary" onClick={save}><Check size={15}/> Save Template</button></div></div>}</div>
}

function Airports({ notify }: { notify: (s: string) => void }) {
  const [rows, setRows] = useState<Airport[]>([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<Airport | null>(null)
  const [form, setForm] = useState<Airport>({ id: 0, icao: '', iata: '', name: '', city: '', state: '', countryCode: '', countryName: '' })
  const pageSize = 50

  async function load() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ q: query, page: String(page), pageSize: String(pageSize) })
      const response = await fetch(`/api/airports?${params.toString()}`)
      if (!response.ok) throw new Error('Airport database request failed')
      const data = await response.json()
      setRows(data.rows || []); setTotal(Number(data.total || 0))
    } catch (error) {
      notify('Unable to load airport database')
    } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [query, page])

  function openEditor(a?: Airport) {
    setEditing(a || null)
    setForm(a || { id: 0, icao: '', iata: '', name: '', city: '', state: '', countryCode: '', countryName: '' })
    setEditorOpen(true)
  }
  async function save() {
    if (!form.icao.trim() && !form.iata.trim()) return notify('ICAO or IATA is required')
    if (!form.name.trim() || !form.city.trim() || !form.countryCode.trim() || !form.countryName.trim()) return notify('Airport name, city, country code and country name are required')
    try {
      const response = await fetch('/api/airports', { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, id: editing?.id }) })
      if (!response.ok) throw new Error('save failed')
      notify(editing ? 'Airport updated' : 'Airport added'); setEditorOpen(false); load()
    } catch { notify('Unable to save airport') }
  }
  async function remove(id: number) {
    try { const response = await fetch(`/api/airports?id=${id}`, { method: 'DELETE' }); if (!response.ok) throw new Error('delete failed'); notify('Airport removed'); load() } catch { notify('Unable to remove airport') }
  }
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return <div className="panel full">
    <div className="sectionIntro"><div><h3>Airports</h3><p>Global airport directory mapped from ICAO/IATA codes to airport, city, state, country code and full country name.</p></div><button className="primary" onClick={() => openEditor()}><Plus size={16} /> Add Airport</button></div>
    <div className="airportToolbar"><div className="searchBox"><Search size={16}/><input value={query} onChange={e => { setQuery(e.target.value); setPage(1) }} placeholder="Search ICAO, IATA, airport, city or country" /></div><span className="mutedText">{loading ? 'Loading…' : `${total.toLocaleString()} coded airport records`}</span></div>
    <div className="tableWrap airportTable"><table><thead><tr><th>IATA</th><th>ICAO</th><th>Airport Name</th><th>City</th><th>State</th><th>Country Code</th><th>Country Name</th><th>Actions</th></tr></thead><tbody>{rows.length ? rows.map(a => <tr key={a.id}><td><b>{a.iata || '—'}</b></td><td><b>{a.icao || '—'}</b></td><td>{a.name}</td><td>{a.city || '—'}</td><td>{a.state || '—'}</td><td>{a.countryCode || '—'}</td><td>{a.countryName || '—'}</td><td><button className="tiny" onClick={() => openEditor(a)}><Edit3 size={13}/></button><button className="tiny" onClick={() => remove(a.id)}><Trash2 size={13}/></button></td></tr>) : <tr><td colSpan={8} style={{ textAlign:'center', padding:28 }}>{loading ? 'Loading airport records…' : 'No airport records found.'}</td></tr>}</tbody></table></div>
    <div className="pager"><button className="secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button><span>Page {page} of {totalPages}</span><button className="secondary" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</button></div>
    {editorOpen && <div className="editor"><h3>{editing ? 'Edit Airport' : 'Add Airport'}</h3><div className="formGrid"><label>IATA code<input value={form.iata} maxLength={3} onChange={e => setForm(f => ({ ...f, iata: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') }))} /></label><label>ICAO code<input value={form.icao} maxLength={4} onChange={e => setForm(f => ({ ...f, icao: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))} /></label><label>Airport name<input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></label><label>City<input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></label><label>State<input value={form.state} maxLength={2} onChange={e => setForm(f => ({ ...f, state: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') }))} /><small>Two-letter abbreviation for U.S. airports.</small></label><label>Country code<input value={form.countryCode} maxLength={2} onChange={e => setForm(f => ({ ...f, countryCode: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') }))} /></label><label>Country name<input value={form.countryName} onChange={e => setForm(f => ({ ...f, countryName: e.target.value }))} /></label></div><div className="formActions"><button className="secondary" onClick={() => setEditorOpen(false)}>Cancel</button><button className="primary" onClick={save}><Check size={15}/> Save Airport</button></div></div>}
  </div>
}

function buildAvcardAlerts(aircraft: Aircraft[], customers: Customer[]): AvcardAlert[] {
  const now = new Date()
  const threshold = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate())
  return aircraft.map(a => {
    const raw = String(a.expiration || '').trim()
    const m = raw.match(/^(0[1-9]|1[0-2])\/(\d{2}|20\d{2})$/)
    if (!m) return null
    const yearNum = m[2].length === 2 ? 2000 + Number(m[2]) : Number(m[2])
    const exp = new Date(yearNum, Number(m[1]), 0, 23, 59, 59, 999)
    const expired = exp < now
    const expiringSoon = !expired && exp <= threshold
    if (!expired && !expiringSoon) return null
    const customer = customers.find(c => c.id === a.customerId)?.name || 'Unassigned'
    return { id: a.id, type: 'AVCARD', message: 'Expiration', aircraft: a.tail, note: expired ? 'AVCARD entered is expired' : 'AVCARD expiring within three months', customer, expiration: raw, status: 'Open' }
  }).filter(Boolean) as AvcardAlert[]
}

function Alerts({ alerts }: { alerts: AvcardAlert[] }) { return <div className="panel full"><div className="sectionIntro"><div><h3>Alerts</h3><p>Daily AVCARD expiration checks across all aircraft.</p></div><span className="alertCount">{alerts.length} open</span></div><div className="tableWrap"><table><thead><tr><th>Type</th><th>Message</th><th>Aircraft</th><th>Note</th><th>Customer</th><th>Expiration</th><th>Status</th></tr></thead><tbody>{alerts.length ? alerts.map(a => <tr key={a.id}><td><span className="alertType critical">{a.type}</span></td><td>{a.message}</td><td><b>{a.aircraft}</b></td><td>{a.note}</td><td>{a.customer}</td><td>{a.expiration}</td><td><span className="alertType critical">Open</span></td></tr>) : <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>No AVCARD expiration alerts.</td></tr>}</tbody></table></div></div> }

function SettingsPage({ notify }: { notify: (s: string) => void }) { const [toggles, setToggles] = useState([true, true, true, true, false, true]); return <div className="settingsGrid"><div className="panel settingSection"><h3>Company Information</h3><label>Company name<input defaultValue="World Fuel Services" /></label><label>Tool name<input defaultValue="Corporate Fuel Management Tool" /></label><label>Default email signature<textarea defaultValue={'World Fuel Services\nCorporate Fuel Management'} /></label><button className="primary" onClick={() => notify('Settings saved')}>Save Settings</button></div><div className="panel settingSection"><h3>System Preferences</h3>{['Enable schedule validation', 'Auto-detect customers', 'Generate FBO communications', 'Enable tankering alerts', 'Send copy to internal team', 'Save schedule history'].map((x, i) => <div className="toggleRow" key={x}><div><b>{x}</b><small>Workflow preference</small></div><button className={toggles[i] ? 'toggle on' : 'toggle'} onClick={() => setToggles(t => t.map((v, j) => j === i ? !v : v))}><i /></button></div>)}<button className="danger" onClick={() => notify('No data was deleted in this prototype')}>Clear Local Test Data</button></div></div> }
