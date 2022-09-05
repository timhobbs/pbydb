import { ConfigurationData } from "src/app/configuration/configuration.interface";
import { Table } from "src/app/table/table.interface";
import { Vpslookup } from "src/app/database/database.interface";

export const CONFIG_COLUMNS = [
    {
        columnDef: 'id',
        header: 'ID',
        cell: (element: ConfigurationData) => `${element.id}`,
        css: 'w10pc',
    },
    {
        columnDef: 'vpxdb',
        header: 'VPX Db',
        cell: (element: ConfigurationData) => `${element.vpxdb}`,
        css: 'w45pc',
    },
    {
        columnDef: 'vpxtables',
        header: 'VPS Tables',
        cell: (element: ConfigurationData) => `${element.vpxtables}`,
        css: 'w45pc',
    },
];

export const TABLE_COLUMNS = [
    {
        columnDef: 'id',
        header: 'ID',
        cell: (element: Table) => `${element.id}`,
        css: 'w5pc',
    },
    {
        columnDef: 'name',
        header: 'Name',
        cell: (element: Table) => `${element.name}`,
        css: 'w15pc',
    },
    {
        columnDef: 'description',
        header: 'Description',
        cell: (element: Table) => `${element.description}`,
        css: 'w15pc',
    },
    {
        columnDef: 'type',
        header: 'Type',
        cell: (element: Table) => `${element.type}`,
        css: 'w5pc',
    },
    {
        columnDef: 'rom',
        header: 'ROM',
        cell: (element: Table) => `${element.rom}`,
        css: 'w5pc',
    },
    {
        columnDef: 'manufacturer',
        header: 'Manufacturer',
        cell: (element: Table) => `${element.manufacturer}`,
        css: 'w15pc',
    },
    {
        columnDef: 'year',
        header: 'Year',
        cell: (element: Table) => `${element.year}`,
        css: 'w5pc',
    },
    {
        columnDef: 'rating',
        header: 'Rating',
        cell: (element: Table) => `${element.rating}`,
        css: 'w5pc',
    },
    {
        columnDef: 'ipdbid',
        header: 'IPDB ID',
        cell: (element: Table) => `${element.ipdbid ?? ''}`,
        css: 'w5pc',
    },
    {
        columnDef: 'vpsid',
        header: 'VPS ID',
        cell: (element: Table) => `${element.vpsid}`,
        css: 'w5pc',
    },
    {
        columnDef: 'b2s',
        header: 'B2S',
        cell: (element: Table) => `${element.b2s}`,
        css: 'w10pc',
    },
    {
        columnDef: 'haspup',
        header: 'Has Pup?',
        cell: (element: Table) => `${element.haspup}`,
        css: 'w5pc',
    },
];

export const VPSLOOKUP_COLUMNS= [
    {
        columnDef: 'id',
        header: 'ID',
        cell: (element: Vpslookup) => `${element.id}`,
        css: 'w2-5pc',
    },
    {
        columnDef: 'GameFileName',
        header: 'Game File Name',
        cell: (element: Vpslookup) => `${element.GameFileName}`,
        css: 'w10pc',
    },
    {
        columnDef: 'GameName',
        header: 'Game Name',
        cell: (element: Vpslookup) => `${element.GameName}`,
        css: 'w10pc',
    },
    {
        columnDef: 'GameDisplay',
        header: 'Game Display',
        cell: (element: Vpslookup) => `${element.GameDisplay}`,
        css: 'w2-5pc',
    },
    {
        columnDef: 'MediaSearch',
        header: 'Media Search',
        cell: (element: Vpslookup) => `${element.MediaSearch}`,
        css: 'w2-5pc',
    },
    {
        columnDef: 'Manufact',
        header: 'Manufacturer',
        cell: (element: Vpslookup) => `${element.Manufact}`,
        css: 'w5pc',
    },
    {
        columnDef: 'GameYear',
        header: 'Game Year',
        cell: (element: Vpslookup) => `${element.GameYear}`,
        css: 'w2-5pc',
    },
    {
        columnDef: 'NumPlayers',
        header: 'Num Players',
        cell: (element: Vpslookup) => `${element.NumPlayers}`,
        css: 'w2-5pc',
    },
    {
        columnDef: 'GameType',
        header: 'Game Type',
        cell: (element: Vpslookup) => `${element.GameType}`,
        css: 'w2-5pc',
    },
    {
        columnDef: 'Category',
        header: 'Category',
        cell: (element: Vpslookup) => `${element.Category}`,
        css: 'w5pc',
    },
    {
        columnDef: 'GameTheme',
        header: 'Game Theme',
        cell: (element: Vpslookup) => `${(element.GameTheme ?? '').split(',')}`,
        css: 'w5pc',
    },
    {
        columnDef: 'WebLinkURL',
        header: 'Web Link URL',
        cell: (element: Vpslookup) => `${element.WebLinkURL}`,
        css: 'w10pc',
    },
    {
        columnDef: 'IPDBNum',
        header: 'IPDB#',
        cell: (element: Vpslookup) => `${element.IPDBNum}`,
        css: 'w2-5pc',
    },
    {
        columnDef: 'AltRunMode',
        header: 'Alt Run Mode',
        cell: (element: Vpslookup) => `${element.AltRunMode}`,
        css: 'w2-5pc',
    },
    {
        columnDef: 'DesignedBy',
        header: 'Designed By',
        cell: (element: Vpslookup) => `${(element.DesignedBy ?? '').split(',')}`,
        css: 'w5pc',
    },
    {
        columnDef: 'Author',
        header: 'Author',
        cell: (element: Vpslookup) => `${(element.Author ?? '').split(',')}`,
        css: 'w5pc',
    },
    {
        columnDef: 'GAMEVER',
        header: 'Game Version',
        cell: (element: Vpslookup) => `${element.GAMEVER}`,
        css: 'w2-5pc',
    },
    {
        columnDef: 'Rom',
        header: 'ROM',
        cell: (element: Vpslookup) => `${element.Rom}`,
        css: 'w2-5pc',
    },
    {
        columnDef: 'Tags',
        header: 'Tags',
        cell: (element: Vpslookup) => `${(element.Tags ?? '').split(',')}`,
        css: 'w2-5pc',
    },
    {
        columnDef: 'VPSID',
        header: 'VPS ID',
        cell: (element: Vpslookup) => `${element.VPSID}`,
        css: 'w2-5pc',
    },
];
