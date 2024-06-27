import React, { useState } from "react";
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";

export default function LeagueModal({
    visible = false, 
    header = "Create League",
    onHide,
    onSuccess
}) {
    const footerContent = (
        <div>
            <Button label="Save League" icon="pi pi-trophy" className="rounded-lg border-primaryS bg-primaryS" onClick={onSuccess} />
        </div>
    );

    const [leagueEmail, setLeagueEmail] = useState('');
    const [leaguePassword, setLeaguePassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Validate form input
        if (!leaguePassword.trim()) {
            alert('Please enter league password.');
            return;
        }
        // Call parent function to join league
        // onJoinLeague(leaguePassword);
        // Reset form
        setLeaguePassword('');
    };


    return (
        <div className="card flex justify-content-center">
            <Dialog className="lg:w-1/4 w-[95%]" header={header} footer={footerContent} visible={visible} onHide={onHide}>
                <form onSubmit={handleSubmit} className="mb-4">
                    <div className="grid lg:grid-cols-1 gap-4">
                        <div className="flex flex-col gap-1">
                            <label htmlFor="league_name" className="font-semibold">League Name</label>
                            <InputText required id="league_name" type="text" keyfilter="league_name" value={leagueEmail} placeholder="League Name" onChange={(e) => setLeagueEmail(e.target.value)} className="text-sm" autoComplete="new-email"/>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label htmlFor="password" className="font-semibold">Password</label>
                            <Password required id="password" inputClassName="w-full text-sm" value={leaguePassword} placeholder="********" feedback={false} tabIndex={1} onChange={(e) => setLeaguePassword(e.target.value)} className="text-sm" autoComplete="new-password"/>
                        </div>
                    </div>
                </form>
            </Dialog>
        </div>
    )
}
      