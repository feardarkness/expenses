SELECT *
FROM public."user";

SELECT *
FROM public.ledger;

SELECT *
FROM public.thing;


select date_trunc('year', date) as truncatedDate, sum(amount) as total
from public.ledger
where user_id = '8ad50083-c92e-4e39-b851-269ef03c4f8b'
group by truncatedDate;

select date_trunc('month', date) as truncatedDate, sum(amount) as total
from public.ledger
where user_id = '8ad50083-c92e-4e39-b851-269ef03c4f8b'
group by truncatedDate;

select date_trunc('week', date) as truncatedDate, sum(amount) as total
from public.ledger
where user_id = '8ad50083-c92e-4e39-b851-269ef03c4f8b'
group by truncatedDate
order by 1 desc;

select date as truncatedDate, sum(amount) as total
from public.ledger
where user_id = '8ad50083-c92e-4e39-b851-269ef03c4f8b'
group by truncatedDate;

select date_trunc('month', date) as truncatedDate, "type", sum(amount) as total
from public.ledger as ledger
where user_id = '8ad50083-c92e-4e39-b851-269ef03c4f8b'
group by truncatedDate, "type"
order by truncatedDate DESC, "type" ASC;

select date_trunc('month', date) as truncatedDate, thing_id, sum(amount) as total
from public.ledger as ledger
where user_id = '8ad50083-c92e-4e39-b851-269ef03c4f8b'
group by truncatedDate, thing_id
order by truncatedDate DESC, thing_id ASC;


