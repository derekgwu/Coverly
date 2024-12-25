'use client';
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import Navbar from "../components/Navbar";
import LetterTemplateService from "../services/LetterTemplateService";
import { useSearchParams } from 'next/navigation';
import { useReactToPrint } from "react-to-print";
import "./styles.css";

const LetterDeployment = () => {
    const { user, error, isLoading } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();
    const letter_id = searchParams.get('letter_id');
    const [letterTemplate, setLetterTemplate] = useState("");
    const [letterName, setLetterName] = useState("");
    const [letterRegex, setLetterRegex] = useState(null);
    const [letterRegexInputs, setLetterRegexInputs] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [printLetter, setPrintLetter] = useState("");
    const letterRef = useRef(null);  
    

    useEffect(() => {
        if (letter_id) {
            LetterTemplateService.getLetterContent(letter_id).then((response) => {
                if (response) {
                    setLetterTemplate(response.content);
                    setLetterName(response.name);
                
                }
            });

            LetterTemplateService.getLetterRegex(letter_id).then((response) => {
                const cleanedArray = response.map(item => {
                    item.regex = item.regex.slice(2,-2)
                    return item
                });

                setLetterRegex(cleanedArray)
            })

            
        }
    }, [letter_id]);

    const handlePrint = useReactToPrint({
        documentTitle: 'Title',
        contentRef: letterRef,
    });

    const handleInputChange = (index, value) => {
        setLetterRegexInputs(prevState => ({
          ...prevState,
          [index]: value,  
        }));
    };

    const replaceAndPrint = () => {
        let template = letterTemplate;
        for(let i = 0; i < letterRegex.length; i++){
            const regex = new RegExp(`/<${letterRegex[i].regex}>/`, 'g');
            template = template.replace(regex, letterRegexInputs[i]);
        }
        
        setPrintLetter(template)
    }

    useEffect(() => {
        if(printLetter.length == 0 || !printLetter){
            return;
        }
        handlePrint();
    }, [printLetter])
    


    return (
        <>
            <div className="main">
                <Navbar />
                <div className="deploy-content">
                    <div className="letter-showcase">
                        <h2>{letterName}</h2>
                        <div className="letter">
                            <div className="letter-print">
                            {letterTemplate && letterTemplate.length > 0 ? (
                                letterTemplate.split("\n").map((line, index) => (
                                    <React.Fragment key={index}>
                                        {line.split("\t").map((segment, idx) => (
                                            <React.Fragment key={idx}>
                                                {idx > 0 && (
                                                    <span style={{ display: "inline-block", width: "2em" }}></span>
                                                )}
                                                {segment}
                                            </React.Fragment>
                                        ))}
                                        <br />
                                    </React.Fragment>
                                ))
                            
                            ) : (
                                <p>Loading Letter</p>
                            )}
                            </div>
                        </div>

                        {/*Hiddden For Printing Purposes*/}
                        <div className="letter" style={{display: "none"}}>
                            <div className="letter-print" ref={letterRef}>
                            {printLetter && printLetter.length > 0 ? (
                                printLetter.split("\n").map((line, index) => (
                                    <React.Fragment key={index}>
                                        {line.split("\t").map((segment, idx) => (
                                            <React.Fragment key={idx}>
                                                <span>
                                                {idx > 0 && (
                                                    <span style={{ display: "inline-block", width: "2em" , fontSize: "14px"}}></span>
                                                )}
                                                {segment}
                                                </span>
                                            </React.Fragment>
                                        ))}
                                        <br />
                                    </React.Fragment>
                                ))
                            
                            ) : (
                                <p>Loading Letter</p>
                            )}
                            </div>
                        </div>
                    </div>
                    <div className="options">
                        <button className="built-in-option" onClick={() => {setShowModal(true)}}>Create a Letter</button>
                        <button className="built-in-option">Edit Template</button>
                        <button className="delete-option">Delete This Template</button>
                    </div>
                </div>

    
            </div>

            {/*modal for selection*/}
            {showModal && 
            <div className="create-form-container">
                <div className="create-form">
                    <h2>Create Cover Letter</h2>
                    <div className="regex-form">
                        {letterRegex && letterRegex.map((regex, i) => (
                            <div key={i}>
                                <h3>{regex.regex}</h3>
                                <input
                                    type="text"
                                    value={letterRegexInputs[i] || ''}  
                                    onChange={(e) => handleInputChange(i, e.target.value)}  
                                    placeholder={`Enter value for ${regex.regex}`}
                                />
                            </div>
                        ))}
                       
                        
                            
                    </div>
                    <div className="regex-form-btns">
                        <button onClick={() => {setShowModal(false)}}>Cancel</button>
                        <button onClick={replaceAndPrint}>Generate Letter</button>
                    </div>
                </div>
            </div>}
        </>
    );
}

export default LetterDeployment;