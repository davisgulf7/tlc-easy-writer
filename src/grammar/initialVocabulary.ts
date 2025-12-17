import type { SubjectItem, VerbItem, QualifierItem, ObjectItem, VocabularyItem } from './types';
import iIcon from '../assets/symbols/i.png';
import youIcon from '../assets/symbols/you.png';
import weIcon from '../assets/symbols/we.png';
import myMomIcon from '../assets/symbols/my_mom.png';
import myDadIcon from '../assets/symbols/my_dad.png';
import myFriendIcon from '../assets/symbols/my_friend.png';
import myTeacherIcon from '../assets/symbols/my_teacher.png';
import myDogIcon from '../assets/symbols/my_dog.png';
import myBrotherIcon from '../assets/symbols/my_brother.png';
import mySisterIcon from '../assets/symbols/my_sister.png';
import myClassIcon from '../assets/symbols/my_class.png';
import myBabyIcon from '../assets/symbols/my_baby.svg';

import likeIcon from '../assets/symbols/like.svg';
import dontLikeIcon from '../assets/symbols/dont_like.svg';
import wantIcon from '../assets/symbols/want.png';
import loveIcon from '../assets/symbols/love.svg';
import needIcon from '../assets/symbols/need.png';
import haveIcon from '../assets/symbols/have.png';
import seeIcon from '../assets/symbols/see.svg';
import hearIcon from '../assets/symbols/hear.svg';
import eatIcon from '../assets/symbols/eat.png';
import playIcon from '../assets/symbols/play.png';
import goIcon from '../assets/symbols/go.svg';
import makeIcon from '../assets/symbols/make.png';

import bigIcon from '../assets/symbols/big.png';
import smallIcon from '../assets/symbols/small.png';
import redIcon from '../assets/symbols/red.png';
import blueIcon from '../assets/symbols/blue.png';
import loudIcon from '../assets/symbols/loud.png';
import quietIcon from '../assets/symbols/quiet.svg';
import happyIcon from '../assets/symbols/happy.svg';
import sadIcon from '../assets/symbols/sad.png';
import fastIcon from '../assets/symbols/fast.png';
import slowIcon from '../assets/symbols/slow.png';
import softIcon from '../assets/symbols/soft.png';
import tastyIcon from '../assets/symbols/tasty.png';

import ballIcon from '../assets/symbols/ball.png';
import bookIcon from '../assets/symbols/book.png';
import dogIcon from '../assets/symbols/dog.png';
import toysIcon from '../assets/symbols/toys.png';
import musicIcon from '../assets/symbols/music.png';
import pizzaIcon from '../assets/symbols/pizza.png';
import playgroundIcon from '../assets/symbols/playground.png';
import schoolIcon from '../assets/symbols/school.png';
import gamesIcon from '../assets/symbols/games.png';
import iceCreamIcon from '../assets/symbols/ice_cream.png';
import tabletIcon from '../assets/symbols/tablet.png';
import carsIcon from '../assets/symbols/cars.png';

import yesIcon from '../assets/symbols/yes.png';
import noIcon from '../assets/symbols/no.png';
import iNeedHelpIcon from '../assets/symbols/i_need_help.png';
import iLikeThatIcon from '../assets/symbols/i_like_that.png';
import iDontLikeThatIcon from '../assets/symbols/i_dont_like_that.png';
import stopIcon from '../assets/symbols/stop.png';
import iWantIcon from '../assets/symbols/i_want.png';
import bathroomIcon from '../assets/symbols/bathroom.png';
import iAmHungryIcon from '../assets/symbols/i_am_hungry.png';
import iAmThirstyIcon from '../assets/symbols/i_am_thirsty.png';
import iAmTiredIcon from '../assets/symbols/i_am_tired.png';
import inPainIcon from '../assets/symbols/in_pain.png';


// --- Subjects ---
export const subjects: SubjectItem[] = [
    { id: 's_i', type: 'subject', label: 'I', level: 1, person: '1', number: 'sg', icon: iIcon },
    { id: 's_you', type: 'subject', label: 'You', level: 1, person: '2', number: 'sg', icon: youIcon },
    { id: 's_we', type: 'subject', label: 'We', level: 1, person: '1', number: 'pl', icon: weIcon },
    { id: 's_mom', type: 'subject', label: 'My Mom', level: 1, person: '3', number: 'sg', icon: myMomIcon },
    { id: 's_dad', type: 'subject', label: 'My Dad', level: 1, person: '3', number: 'sg', icon: myDadIcon },
    { id: 's_friend', type: 'subject', label: 'My Friend', level: 1, person: '3', number: 'sg', icon: myFriendIcon },
    { id: 's_teacher', type: 'subject', label: 'My Teacher', level: 1, person: '3', number: 'sg', icon: myTeacherIcon },
    { id: 's_dog', type: 'subject', label: 'My Dog', level: 1, person: '3', number: 'sg', icon: myDogIcon },
    // Level 2
    { id: 's_brother', type: 'subject', label: 'My Brother', level: 2, person: '3', number: 'sg', icon: myBrotherIcon },
    { id: 's_sister', type: 'subject', label: 'My Sister', level: 2, person: '3', number: 'sg', icon: mySisterIcon },
    { id: 's_class', type: 'subject', label: 'My Class', level: 2, person: '3', number: 'pl', icon: myClassIcon },
    { id: 's_baby', type: 'subject', label: 'My Baby', level: 2, person: '3', number: 'sg', icon: myBabyIcon },
];

// --- Verbs ---
export const verbs: VerbItem[] = [
    { id: 'v_like', type: 'verb', label: 'like', level: 1, baseForm: 'like', thirdPersonSingular: 'likes', icon: likeIcon },
    { id: 'v_dontlike', type: 'verb', label: "don't like", level: 1, baseForm: "don't like", thirdPersonSingular: "doesn't like", icon: dontLikeIcon },
    { id: 'v_want', type: 'verb', label: 'want', level: 1, baseForm: 'want', thirdPersonSingular: 'wants', icon: wantIcon },
    { id: 'v_love', type: 'verb', label: 'love', level: 1, baseForm: 'love', thirdPersonSingular: 'loves', icon: loveIcon },
    { id: 'v_need', type: 'verb', label: 'need', level: 1, baseForm: 'need', thirdPersonSingular: 'needs', icon: needIcon },
    { id: 'v_have', type: 'verb', label: 'have', level: 1, baseForm: 'have', thirdPersonSingular: 'has', icon: haveIcon },
    { id: 'v_see', type: 'verb', label: 'see', level: 1, baseForm: 'see', thirdPersonSingular: 'sees', icon: seeIcon },
    { id: 'v_hear', type: 'verb', label: 'hear', level: 1, baseForm: 'hear', thirdPersonSingular: 'hears', icon: hearIcon },
    // Level 2
    { id: 'v_eat', type: 'verb', label: 'eat', level: 2, baseForm: 'eat', thirdPersonSingular: 'eats', icon: eatIcon },
    { id: 'v_play', type: 'verb', label: 'play', level: 2, baseForm: 'play', thirdPersonSingular: 'plays', icon: playIcon },
    { id: 'v_go', type: 'verb', label: 'go', level: 2, baseForm: 'go', thirdPersonSingular: 'goes', icon: goIcon },
    { id: 'v_make', type: 'verb', label: 'make', level: 2, baseForm: 'make', thirdPersonSingular: 'makes', icon: makeIcon },
];

// --- Qualifiers ---
export const qualifiers: QualifierItem[] = [
    { id: 'q_big', type: 'qualifier', label: 'big', level: 1, icon: bigIcon },
    { id: 'q_small', type: 'qualifier', label: 'small', level: 1, icon: smallIcon },
    { id: 'q_red', type: 'qualifier', label: 'red', level: 1, icon: redIcon },
    { id: 'q_blue', type: 'qualifier', label: 'blue', level: 1, icon: blueIcon },
    { id: 'q_loud', type: 'qualifier', label: 'loud', level: 1, icon: loudIcon },
    { id: 'q_quiet', type: 'qualifier', label: 'quiet', level: 1, icon: quietIcon },
    { id: 'q_happy', type: 'qualifier', label: 'happy', level: 1, icon: happyIcon },
    { id: 'q_sad', type: 'qualifier', label: 'sad', level: 1, icon: sadIcon },
    // Level 2
    { id: 'q_fast', type: 'qualifier', label: 'fast', level: 2, icon: fastIcon },
    { id: 'q_slow', type: 'qualifier', label: 'slow', level: 2, icon: slowIcon },
    { id: 'q_soft', type: 'qualifier', label: 'soft', level: 2, icon: softIcon },
    { id: 'q_tasty', type: 'qualifier', label: 'tasty', level: 2, icon: tastyIcon },
];

// --- Objects ---
export const objects: ObjectItem[] = [
    // Countable Singular (Logic: adds 'a'/'an')
    { id: 'o_ball', type: 'object', label: 'ball', level: 1, nounType: 'countable', defaultNumber: 'sg', articlePolicy: 'auto_indefinite', pluralForm: 'balls', icon: ballIcon },
    { id: 'o_book', type: 'object', label: 'book', level: 1, nounType: 'countable', defaultNumber: 'sg', articlePolicy: 'auto_indefinite', pluralForm: 'books', icon: bookIcon },
    { id: 'o_dog', type: 'object', label: 'dog', level: 1, nounType: 'countable', defaultNumber: 'sg', articlePolicy: 'auto_indefinite', pluralForm: 'dogs', icon: dogIcon },

    // Set Plural (Logic: no article, just 'toys')
    { id: 'o_toys', type: 'object', label: 'toys', level: 1, nounType: 'set_plural', defaultNumber: 'pl', articlePolicy: 'none', icon: toysIcon },

    // Mass Nouns (Logic: no article)
    { id: 'o_music', type: 'object', label: 'music', level: 1, nounType: 'mass', defaultNumber: 'sg', articlePolicy: 'none', icon: musicIcon },
    { id: 'o_pizza', type: 'object', label: 'pizza', level: 1, nounType: 'countable', defaultNumber: 'sg', articlePolicy: 'auto_indefinite', pluralForm: 'pizzas', icon: pizzaIcon },

    // Proper/Place (Logic: might need 'the' or nothing)
    { id: 'o_playground', type: 'object', label: 'playground', level: 1, nounType: 'proper', defaultNumber: 'sg', articlePolicy: 'definite', icon: playgroundIcon },
    { id: 'o_school', type: 'object', label: 'school', level: 1, nounType: 'proper', defaultNumber: 'sg', articlePolicy: 'none', icon: schoolIcon },

    // Level 2
    { id: 'o_games', type: 'object', label: 'games', level: 2, nounType: 'set_plural', defaultNumber: 'pl', articlePolicy: 'none', icon: gamesIcon },
    { id: 'o_icecream', type: 'object', label: 'ice cream', level: 2, nounType: 'mass', defaultNumber: 'sg', articlePolicy: 'none', icon: iceCreamIcon },
    { id: 'o_tablet', type: 'object', label: 'tablet', level: 2, nounType: 'countable', defaultNumber: 'sg', articlePolicy: 'auto_indefinite', pluralForm: 'tablets', icon: tabletIcon },
    { id: 'o_cars', type: 'object', label: 'cars', level: 2, nounType: 'set_plural', defaultNumber: 'pl', articlePolicy: 'none', icon: carsIcon },
];

// --- Phrases ---
export const phrases: VocabularyItem[] = [
    { id: 'p_yes', label: 'Yes', type: 'phrase', level: 1, icon: yesIcon },
    { id: 'p_no', label: 'No', type: 'phrase', level: 1, icon: noIcon },
    { id: 'p_help', label: 'I need help', type: 'phrase', level: 1, icon: iNeedHelpIcon },
    { id: 'p_like', label: 'I like that', type: 'phrase', level: 1, icon: iLikeThatIcon },
    { id: 'p_dontlike', label: 'I don\'t like that', type: 'phrase', level: 1, icon: iDontLikeThatIcon },
    { id: 'p_stop', label: 'Stop', type: 'phrase', level: 1, icon: stopIcon },
    { id: 'p_want', label: 'I want', type: 'phrase', level: 1, icon: iWantIcon },
    { id: 'p_bathroom', label: 'Bathroom', type: 'phrase', level: 1, icon: bathroomIcon },
    // Level 2 Additions
    { id: 'p_hungry', label: 'I am hungry', type: 'phrase', level: 2, icon: iAmHungryIcon },
    { id: 'p_thirsty', label: 'I am thirsty', type: 'phrase', level: 2, icon: iAmThirstyIcon },
    { id: 'p_tired', label: 'I am tired', type: 'phrase', level: 2, icon: iAmTiredIcon },
    { id: 'p_pain', label: 'In pain', type: 'phrase', level: 2, icon: inPainIcon },
];
