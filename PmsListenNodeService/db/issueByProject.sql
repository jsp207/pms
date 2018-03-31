select (select REPLACE(name,'.','') as cname  from versions where id = fixed_version_id ) as cname ,work_packages.project_id as project_id, work_packages.subject,statuses.id, statuses.name as statusname,
        (select COUNT(1) 
        from work_packages i 
        where i.project_id in ( 34 )
        and i.status_id = statuses.id and i.fixed_version_id = work_packages.fixed_version_id   ) as totalIssueCount        
        from work_packages, statuses
        where work_packages.project_id in ( 34 )
        group by work_packages.fixed_version_id ,statuses.id
        order by 1,3;