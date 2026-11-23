export function jstDay(date=new Date()){const shifted=new Date(date.getTime()-2*60*60*1000);return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Tokyo',year:'numeric',month:'2-digit',day:'2-digit'}).format(shifted)}
export function jstHour(date=new Date()){return Number(new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Tokyo',hour:'2-digit',hourCycle:'h23'}).format(date))}
export function decide(device,day,slot=null){
 if(!device.enabled||device.completed_day===day||device.last_sent_day===(slot===null?day:day+':'+slot))return null;
 if(device.streak>0&&(device.streak+1)%7===0)return {kind:'milestone',title:'Riffinity · 総練習日数の節目まであと1日',body:'今日の3分で、累計練習日数を増やしましょう。'};
 return {kind:'normal',title:'Riffinity · 今日の3分',body:'少しだけ楽器に触れてみませんか？'};
}
export function validDay(x){if(x===null)return true;if(typeof x!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(x))return false;const d=new Date(x+'T00:00:00Z');return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===x}
