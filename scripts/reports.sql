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

-- group by type
select date_trunc('month', date) as truncatedDate, "type", sum(amount) as total
from public.ledger as ledger
where user_id = '8ad50083-c92e-4e39-b851-269ef03c4f8b'
group by truncatedDate, "type"
order by truncatedDate DESC, "type" ASC;

-- group by thing
select date_trunc('month', date) as truncatedDate, thing_id, sum(amount) as total
from public.ledger as ledger
where user_id = '8ad50083-c92e-4e39-b851-269ef03c4f8b'
group by truncatedDate, thing_id
order by truncatedDate DESC, thing_id ASC;

-- group by both
select date_trunc('month', date) as truncatedDate, "type", thing_id, sum(amount) as total
from public.ledger as ledger
where user_id = '8ad50083-c92e-4e39-b851-269ef03c4f8b'
group by truncatedDate, thing_id, "type"
order by truncatedDate DESC, thing_id ASC, "type" ASC;

-- Test
SELECT truncatedDate, "type", coalesce(total, 0)
FROM (SELECT truncatedDate::date, "type"
	FROM generate_series(date_trunc('month', '2021-01-03T00:00:00'::date)::timestamp,
					     date_trunc('month', '2021-08-18T00:00:00'::date)::timestamp,
						  interval  '1 month') truncatedDate, (VALUES ('Income'), ('Expense')) as x("type")) d
LEFT JOIN(
	SELECT date_trunc('month', date) as truncatedDate, "type"::text, sum(amount) as total
	FROM public.ledger as ledger
	WHERE user_id = '8ad50083-c92e-4e39-b851-269ef03c4f8b'
		AND date >= '2021-01-01'
	    AND date <= '2021-08-18'
	GROUP BY truncatedDate, "type"	
) t USING(truncatedDate, "type")
ORDER BY truncatedDate DESC,  "type" ASC


-- 
SELECT truncatedDate, thing_id, coalesce(total, 0)
FROM (SELECT truncatedDate::date
	  FROM generate_series(date_trunc('month', '2021-01-03T00:00:00'::date)::timestamp,
					     date_trunc('month', '2021-08-18T00:00:00'::date)::timestamp,
						  interval  '1 month')truncatedDate ) e
LEFT JOIN(
	SELECT date_trunc('month', date) as truncatedDate, thing_id, sum(amount) as total
	FROM public.ledger as ledger
	WHERE user_id = '8ad50083-c92e-4e39-b851-269ef03c4f8b'
		AND date >= '2021-01-01'
	    AND date <= '2021-08-18'
	GROUP BY truncatedDate, thing_id
) t USING(truncatedDate)
ORDER BY truncatedDate DESC


--
SELECT truncatedDate::date, "type"
FROM generate_series(date_trunc('month', '2021-01-03T00:00:00'::date)::timestamp,
					  date_trunc('month', '2021-08-18T00:00:00'::date)::timestamp,
					  interval  '1 month') truncatedDate, (VALUES ('Income'), ('Expense')) as t("type");
						  
SELECT date_trunc('month', '2021-01-03T00:00:00'::date)
						  
						  
						  
						  