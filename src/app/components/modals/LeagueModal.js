import React, { useEffect, useState } from "react";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { useToast } from "../../contexts/ToastContext";
import { Dropdown } from "primereact/dropdown";
import { useAxios } from "../../contexts/AxiosContext";

export default function LeagueModal({
    visible = false, 
    header = "Create League",
    onHide,
    onSuccess,
    currentUser,
    data = null
}) {
    const showToast = useToast();
    const axiosService = useAxios();

    const [leagueAdmin, setLeagueAdmin] = useState(undefined);
    const [leagueName, setLeagueName] = useState('');
    const [leaguePassword, setLeaguePassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!leaguePassword.trim() && !data) {
            showToast({
                severity: 'error',
                summary: 'Failed!',
                detail: 'Please enter league password.'
            });
            return;
        }

        if(data && data.id != ""){
            axiosService.patch('/api/leagues/update/'+ (data && data.id || ''), {
                name: leagueName,
                user_id: leagueAdmin && leagueAdmin.id || currentUser.id,
                password: leaguePassword,
            }).then((response) => {
                if(response.data.status){
                    showToast({
                        severity: 'success',
                        summary: 'Success!',
                        detail: response.data.message
                    });
                    handleOnSuccess();
                }
            }).catch((error) => {
                console.log(error);
            });
        } else {
            axiosService.post('/api/leagues/store', {
                name: leagueName,
                user_id: leagueAdmin && leagueAdmin.id || currentUser.id,
                password: leaguePassword,
            }).then((response) => {
                if(response.data.status){
                    showToast({
                        severity: 'success',
                        summary: 'Success!',
                        detail: response.data.message
                    });
                    handleOnSuccess();
                }
            }).catch((error) => {
                console.log(error);
            });
        }
    };

    const [users, setUsers] = useState();
    const getUsers = () => {
        axiosService.get('/api/users/league-admins').then((response) => {
            setUsers(response.data);
            if(data){
                setLeagueAdmin(response.data.find((e => e.id === data.user_id)));
            }
        }).catch((error) => {
            console.log(error);
        });
    }

    useEffect(() => {
        if(visible && currentUser && currentUser.role_id == 1){
            getUsers();
        }
        setLeagueName(data && data.name || '');
    }, [visible]);

    const handleOnHide  = () => {
        setLeagueAdmin(null);
        setLeagueName('');
        setLeaguePassword('');
        onHide();
    }

    const handleOnSuccess = () => {
        onSuccess();
        handleOnHide();
    }

    return (
        <div className="card flex justify-content-center">
            <Dialog className="lg:w-1/4 w-[95%]" header={header} visible={visible} draggable={false} maximizable={false} onHide={handleOnHide}>
                <form onSubmit={handleSubmit}>
                    <div className="grid lg:grid-cols-1 gap-4">
                        {
                            currentUser && currentUser.role_id == 1 && (
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="league_admin" className="font-semibold">League Admin</label>
                                    <Dropdown required value={leagueAdmin} options={users} optionLabel="name" onChange={(e) => setLeagueAdmin(e.value)} placeholder="Select League Admin"/>
                                </div>
                            )
                        }
                        
                        <div className="flex flex-col gap-1">
                            <label htmlFor="league_name" className="font-semibold">League Name</label>
                            <InputText required id="league_name" type="text" value={leagueName} placeholder="League Name" onChange={(e) => setLeagueName(e.target.value)} className="text-sm"/>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="password" className="font-semibold">Password</label>
                            <Password required={!data} id="password" inputClassName="w-full text-sm" value={leaguePassword} placeholder="********" feedback={false} tabIndex={1} onChange={(e) => setLeaguePassword(e.target.value)} className="text-sm" autoComplete="new-password"/>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" label="Save League" icon="pi pi-trophy" className="rounded-lg border-primaryS bg-primaryS" />
                        </div>
                    </div>
                </form>
            </Dialog>
        </div>
    )
}
      