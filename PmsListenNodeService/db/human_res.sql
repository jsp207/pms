

select assigned_to_id, (select firstname from users where id = assigned_to_id) as assigned_first_name, (select lastname from users where id = assigned_to_id) as assigned_last_name,
                                              work_packages.id, statuses.name, 
                                         	    (select COUNT(1) 
                                               from work_packages i 
                                               where i.project_id in (1)
                                               and ((i.assigned_to_id = work_packages.assigned_to_id and i.assigned_to_id is not null)or(i.assigned_to_id is null and work_packages.assigned_to_id is null)) and i.status_id = statuses.id) as totalassignedbystatuses
                                               from work_packages, statuses  
                                               where project_id in (1) 
                                               group by assigned_to_id, assigned_first_name, assigned_last_name, statuses.id, statuses.name
                                               order by 2,3;