export function jstDay(date=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(date)}
export function jstHour(date=new Date()){return Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tokyo',hour:'2-digit',hourCycle:'h23'}).format(date))}
export function decide(device,day){
 if(!device.enabled||device.completed_day===day||device.last_sent_day===day)return null;
 if(device.freezes===0)return {kind:'critical',title:'Riffinity · 連続記録を守ろう',body:'今日の3分で、練習の習慣をつなぎましょう。'};
 if(device.freezes===1)return {kind:'low-freeze',title:'Riffinity · フリーズ残り1回',body:'今日の3分でフリーズを温存しましょう。'};
 if(device.streak>0&&(device.streak+1)%7===0)return {kind:'milestone',title:'Riffinity · あと1日で節目！',body:'今日の3分で連続記録を伸ばしましょう。'};
 return {kind:'normal',title:'Riffinity · 今日の3分',body:'少しだけ楽器に触れてみませんか？'};
}
export function validDay(x){if(x===null)return true;if(typeof x!=='string'||!/^\\d{4}-\\d{2}-\\d{2}$/.test(x))return false;const d=new Date(x+'T00:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===x}
