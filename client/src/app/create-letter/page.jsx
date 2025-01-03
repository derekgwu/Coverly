"use client"
import "./styles.css"
import Navbar from "../components/Navbar";
import React, {useEffect, useState, useRef} from "react"
import LetterTemplateService from "../services/LetterTemplateService";
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';

export default function CreateScreen() {
    const [letter, setLetter]= useState("");
    const [letterName, setLetterName] = useState("");
    const textareaRef = useRef(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const letter_id = searchParams.get('letter_id');
    const navigateTo = (link) => {
        router.push(link);
    }

    

    const [cursorPosition, setCursorPosition] = useState(0);
    const [variable, setVariable] = useState([]);
    const [variableSet, setVariableSet] = useState([]);

    //should be login to access this page in the first place
    const { user, error, isLoading } = useUser();

    useEffect(() => {
        if(letter_id != null){
            LetterTemplateService.getLetterContent(letter_id).then((response) => {
                setLetter(response.content)
                setLetterName(response.name)
            })

            LetterTemplateService.getLetterRegex(letter_id).then((response) => {
                const cleanedArray = response.map(item => {
                    item.regex = item.regex.slice(2,-2)
                    return item
                });

                const arr = []
                cleanedArray.map(item => {
                    arr.push(item.regex)
                    return
                })
                console.log(arr)
                

                setVariableSet(arr)
            })
        }
    },[letter_id])
    

    const updateLetter = (e) => {
        console.log(e.target.value);
        setLetter(e.target.value);
    }

    const updateLetterName = (e) => {
        setLetterName(e.target.value)
    }

    const updateVariable = (e) => {
        setVariable(e.target.value);
    }

    const addVariable = () => {
        if(variable.length == 0){
            return;
        }
        const textarea = textareaRef.current;
        const cursorPos = textarea.selectionStart;
        const textBefore = letter.substring(0, cursorPos);
        const textAfter = letter.substring(cursorPos);
        const regex = " /<" + variable + ">/ "
        setLetter(textBefore + regex + textAfter);

         
        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = cursorPos + regex.length;
            textarea.focus(); 
        }, 0);
        setVariableSet([...variableSet, variable])
        setVariable("")
        
    }

    const removeVariable = (variable) => {
        const regex = new RegExp(`/<${variable}>/`, 'g');
        let letterReplace = letter
        letterReplace = letterReplace.replace(regex, "");
        setLetter(letterReplace)
        setVariableSet((prevItems) => prevItems.filter((item) => item !== variable));
      };

    const addVariableViaBtn = (args) => {
        
        const textarea = textareaRef.current;
        const cursorPos = textarea.selectionStart;
        const textBefore = letter.substring(0, cursorPos);
        const textAfter = letter.substring(cursorPos);
        const regex = " /<" + args + ">/ "
        setLetter(textBefore + regex + textAfter);

         
        setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = cursorPos + regex.length;
            textarea.focus(); 
        }, 0);
    }

    const createLetter = () => {
        LetterTemplateService.createLetterTemplate(user?.email, letter, letterName);
        setShowModal(false)
        navigateTo("/profile")
    }

    const saveLetter = () => {
        LetterTemplateService.updateLetterTemplate(user?.email, letter, letterName, letter_id);
        setShowModal(false)
        navigateTo("/profile")
    }

    const [showModal, setShowModal] = useState(false);

   
  return (
    <div className="create-main">
        <Navbar/>
        <div className="main">
            <div className="write-letter">
                <h2>Write Your Cover Template</h2>
                <textarea 
                ref ={textareaRef}
                className="letterbox" 
                onChange={updateLetter}
                value={letter}
                ></textarea>
            </div>
            <div className="variable-section">
                <h3>Add New Element</h3>
                <div className="variable-adder-sec">
                    <input onChange={updateVariable} value={variable} className="variable-adder"></input>
                    <button onClick={addVariable} className="variable-add-btn">Add +</button>
                </div>
                <div className="variable-set">
                {variableSet.map(item => (
                    <div className="variable-btn" key={item}>
                        <button onClick={() => {addVariableViaBtn(item)}}className="variable-set-btn" >{item}</button>
                        <button className="variable-rm-btn" onClick={()=>{removeVariable(item)}}>x</button>
                    </div>
                ))}
                </div>
                <div className="create-template-div">
                    <button className="create-template-btn" onClick={()=>{setShowModal(true)}}>Create Template</button>
                </div>
            
                
            </div>
        </div>
        {showModal && 
        <div className="modal">
            <div className="name-creation-modal">
                <h1>Name Your Template</h1>
                <input className="name-adder" value={letterName} onChange={updateLetterName}></input>
                <div className="btn-div">
                    <button className="name-save-btn" onClick={()=>{setShowModal(false)}}>Cancel</button>
                    <button className="name-save-btn" onClick={letter_id ? saveLetter: createLetter}>Save</button>

                </div>
                
            </div>
        </div>}
       
    </div>
  );
}