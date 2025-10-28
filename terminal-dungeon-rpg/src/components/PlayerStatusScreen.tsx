import React, { useMemo } from 'react';
import { Player } from '../types';
import { getFullItemName, getRaceName } from '../utils';
import { CLASSES, itens_db, RACES } from '../data/gameData';
// FIX: Import ClassBonusMult to correctly type class bonus object.
import { ItemData, Race, ClassBonusMult } from '../types';
import * as C from '../constants';

interface AttributeBreakdownProps {
    label: string;
    total: number;
    base: number;
    flatEquip: number;
    percentEquip: number;
    classBonusPercent: number;
}

const AttributeBreakdown: React.FC<AttributeBreakdownProps> = ({ label, total, base, flatEquip, percentEquip, classBonusPercent }) => (
    <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
        <p className="font-bold text-lg">{label}: <span className="text-white">{total}</span></p>
        <p className="text-xs text-gray-400 mt-1">
            = (Base: <span className="text-green-300">{base}</span>
            + Equip (Flat): <span className="text-green-300">{flatEquip}</span>)
            * (1 + Equip %: <span className="text-blue-300">{percentEquip.toFixed(2)}</span>)
            * (1 + Class %: <span className="text-purple-300">{classBonusPercent.toFixed(2)}</span>)
        </p>
    </div>
);

interface BreakdownDetail {
    label: string;
    value: number | string;
    color?: string;
}

const CombatStatBreakdown: React.FC<{label: string; total: number; breakdown: BreakdownDetail[]}> = ({label, total, breakdown}) => (
    <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
        <p className="font-bold text-lg">{label}: <span className="text-white">{total}</span></p>
        <ul className="text-xs text-gray-400 mt-1 pl-2 border-l border-gray-600 space-y-0.5">
            {breakdown.map(detail => (detail.value !== 0 && detail.value !== '0') && (
                <li key={detail.label} className="flex justify-between">
                    <span>{detail.label}:</span>
                    <span className={detail.color || 'text-green-300'}>{`${detail.value}`}</span>
                </li>
            ))}
        </ul>
    </div>
);


const PlayerStatusScreen: React.FC<{ player: Player; onBack: () => void; }> = ({ player, onBack }) => {
    
    const breakdown = useMemo(() => {
        if (!player) return null;

        let flatStr = 0, flatCon = 0, flatDex = 0, flatLck = 0;
        let percentStr = 0, percentCon = 0, percentDex = 0, percentLck = 0;
        let equipAtk = 0, equipDef = 0;

        for (const slot of ['arma', 'armadura', 'amuleto', 'anel']) {
            const item = player.equipado[slot as keyof typeof player.equipado];
            if (item) {
                const itemData = itens_db[item.id as keyof typeof itens_db] as ItemData;
                if (itemData?.stats) {
                    const stats = itemData.stats;
                    flatStr += stats.str || 0; flatCon += stats.con || 0; flatDex += stats.dex || 0; flatLck += stats.lck_base || 0;
                    percentStr += stats.str_percent || 0; percentCon += stats.con_percent || 0; percentDex += stats.dex_percent || 0; percentLck += stats.lck_base_percent || 0;
                    equipAtk += stats.atk || 0; equipDef += stats.def || 0;
                }
            }
        }
        
        // FIX: Add explicit type to prevent `keyof classMult` from being `never`.
        const classMult: ClassBonusMult = CLASSES[player.playerClass as keyof typeof CLASSES]?.bonus_mult || {};

        // FIX: Reworked this function to correctly calculate stats and return an object
        // matching the props for the `AttributeBreakdown` component.
        const createAttributeBreakdown = (base: number, flat: number, percent: number, multKey: keyof ClassBonusMult) => {
            const classBonusPercent = classMult[multKey] || 0;
            // The formula is (base + flat) * (1 + percent) * (1 + class_percent)
            const subtotal = (base + flat) * (1 + percent);
            const total = Math.floor(subtotal * (1 + classBonusPercent));
            return { total, base, flatEquip: flat, percentEquip: percent, classBonusPercent };
        };

        const strength = createAttributeBreakdown(player.strength, flatStr, percentStr, 'strength');
        const constitution = createAttributeBreakdown(player.constitution, flatCon, percentCon, 'constitution');
        const dexterity = createAttributeBreakdown(player.dexterity, flatDex, percentDex, 'dexterity');
        const luck = createAttributeBreakdown(player.luck_base, flatLck, percentLck, 'luck_base');
        
        // RAGE
        let strTotalAfterRage = strength.total;
        let dexTotalAfterRage = dexterity.total;
        let rageStrBonus = 0;
        let rageDexPenalty = 0;
        
        if (player.race === Race.HalfOrc) {
            const hpPercent = player.vida > 0 && player.vida_max_total > 0 ? player.vida / player.vida_max_total : 1;
            if (hpPercent < 0.20) {
                strTotalAfterRage = Math.floor(strength.total * 1.40);
                dexTotalAfterRage = Math.floor(dexterity.total * 0.70);
            } else if (hpPercent < 0.40) {
                strTotalAfterRage = Math.floor(strength.total * 1.20);
                dexTotalAfterRage = Math.floor(dexterity.total * 0.85);
            }
            rageStrBonus = strTotalAfterRage - strength.total;
            rageDexPenalty = dexTotalAfterRage - dexterity.total; // will be negative or 0
        }
        
        // SCALING
        let scalingAtk = 0, scalingDef = 0;
        const finalAttributes = { str: strTotalAfterRage, con: constitution.total, dex: dexTotalAfterRage, lck_base: luck.total };

        for (const slot of ['arma', 'armadura']) {
            const itemInst = player.equipado[slot as keyof typeof player.equipado];
            if (itemInst) {
                const itemData = itens_db[itemInst.id as keyof typeof itens_db] as ItemData;
                const scaling = itemData?.stats?.scaling;
                if (scaling) {
                    const scalingStatValue = finalAttributes[scaling.stat];
                    const bonus = Math.floor(scalingStatValue * scaling.multiplier);
                    if (slot === 'arma') scalingAtk += bonus;
                    if (slot === 'armadura') scalingDef += bonus;
                }
            }
        }

        const atkDetails: BreakdownDetail[] = [
            { label: 'Base Value', value: C.ATK_BASE_START },
            { label: `From STR (${strTotalAfterRage})`, value: strTotalAfterRage },
            { label: 'From Equip (Flat)', value: equipAtk },
            { label: 'From Equip (Scaling)', value: scalingAtk },
        ];
        if (rageStrBonus > 0) {
            atkDetails.splice(2, 0, { label: 'From Rage', value: `+${rageStrBonus}`, color: 'text-orange-400' });
        }
        
        const defDetails: BreakdownDetail[] = [
            { label: 'Base Value', value: C.DEF_BASE_START },
            { label: `From DEX (${dexTotalAfterRage})`, value: dexTotalAfterRage },
            { label: 'From Equip (Flat)', value: equipDef },
            { label: 'From Equip (Scaling)', value: scalingDef },
        ];
        if (rageDexPenalty < 0) {
            defDetails.splice(2, 0, { label: 'From Rage', value: rageDexPenalty, color: 'text-red-400' });
        }


        // FIX: Corrected typo 'createBreakdown' to use the already calculated 'strength' variable.
        return { 
            strength,
            constitution, dexterity, luck, 
            atk: { total: player.ataque_total, breakdown: atkDetails }, 
            def: { total: player.defesa_total, breakdown: defDetails } 
        };
    }, [player]);
    
    if (!breakdown) return <div>Loading...</div>;

    return (
    <div className="flex flex-col p-2">
      <div className="text-center border-b-2 border-green-700 pb-2 mb-4">
        <h2 className="text-2xl text-green-400">Character Status</h2>
        <p className="text-lg">{`${player.name} - Level ${player.level} ${getRaceName(player.race)} ${CLASSES[player.playerClass as keyof typeof CLASSES].nome}`}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow overflow-y-auto pr-2 max-h-[60vh]">
        <div className="space-y-4">
            <div>
                <h3 className="text-xl text-yellow-300 mb-2 border-b border-gray-700">Vitals & Equipment</h3>
                <p><strong>HP: </strong><span className="text-red-400">{`${player.vida} / ${player.vida_max_total}`}</span></p>
                <p><strong>XP: </strong><span className="text-blue-400">{`${player.xp} / ${player.xp_proximo_nivel}`}</span></p>
                <p><strong>Gold: </strong><span className="text-yellow-400">{`💰${player.carteira}g`}</span></p>
                <p className="mt-2"><strong>Weapon: </strong>{getFullItemName(player.equipado.arma)}</p>
                <p><strong>Armor: </strong>{getFullItemName(player.equipado.armadura)}</p>
                <p><strong>Amulet: </strong>{getFullItemName(player.equipado.amuleto)}</p>
                <p><strong>Ring: </strong>{getFullItemName(player.equipado.anel)}</p>
            </div>
             <div>
                <h3 className="text-xl text-yellow-300 mb-2 border-b border-gray-700">Combat Stats Breakdown</h3>
                <div className="space-y-2">
                    <CombatStatBreakdown label="Attack" total={breakdown.atk.total} breakdown={breakdown.atk.breakdown} />
                    <CombatStatBreakdown label="Defense" total={breakdown.def.total} breakdown={breakdown.def.breakdown} />
                </div>
            </div>
        </div>
        
        <div className="space-y-2">
            <h3 className="text-xl text-yellow-300 mb-2 border-b border-gray-700">Attributes Breakdown</h3>
            {/* FIX: Use spread syntax with the correctly shaped breakdown objects to pass props,
                fixing prop mismatch errors and simplifying the code. */}
            <div className="space-y-2">
                <AttributeBreakdown label="Strength" {...breakdown.strength} />
                <AttributeBreakdown label="Constitution" {...breakdown.constitution} />
                <AttributeBreakdown label="Dexterity" {...breakdown.dexterity} />
                <AttributeBreakdown label="Luck" {...breakdown.luck} />
            </div>
        </div>
      </div>
      <div className="mt-6 text-center"> 
        <button onClick={onBack} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-8 text-lg border-b-4 border-gray-800 hover:border-gray-600 rounded transition duration-200">Back</button>
      </div>
    </div>
  );
};

export default PlayerStatusScreen;
