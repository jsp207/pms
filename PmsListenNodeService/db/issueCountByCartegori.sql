select (select REPLACE(name,'.','') as cname  from categories where id = category_id ) as cname ,work_packages.subject,statuses.id, statuses.name,
        (select COUNT(1) 
        from work_packages i 
        where i.project_id in ( 78,92,121 )
        and i.status_id = statuses.id and i.category_id = work_packages.category_id   ) as totalIssueCount        
        from work_packages, statuses
        where work_packages.project_id in ( 78,92,121 ) and cname<>null
        group by work_packages.category_id ,statuses.id
        order by 1,3;